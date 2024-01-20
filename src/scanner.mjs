import config from './config.json' assert { type: "json" }
import net from "net"
import { exec } from "child_process"
import cprocess from "child_process"
import spinners from "cli-spinners"
import ora from 'ora'
import os from "os"
import log4js from "log4js"
import WebSocket from "ws"

log4js.configure({
    appenders: { copenjs: { type: "file", filename: process.cwd() + "/logs/" + Date.now() + ".log" }, console: { type: "stdout" } },
    categories: { default: { appenders: ["copenjs", "console"], level: config.scanner.logger } },
});
var logger = log4js.getLogger("copenJS");
var server = net.createServer()

let ws

const servport = config.scanner['tcp-servport']
let masscanStatus = false

let currData = {
    lastIp: "",
    tcpRestarts: 0,
    total: 0,
    finds: 0,
    subprocesses: 0,
    assigned: 0,
    totalLast: 0,
    crashedTotal: 0
}

var colors = ["\x1b[31m", "\x1b[32m", "\x1b[33m"]

let processList = []
let assignedList = []
let crashedList = []
let compromisedList = []
var text = ora()
text.spinner = spinners.dots13

const startMasscan = () => startProcess(`masscan 0.0.0.0/0 -p${config.masscan.port} -oJ ${config.masscan.outputFile} --max-rate ${config.masscan.rate} --excludefile ${config.masscan.excludeFile}`, (process.cwd().split("/src")[0])).then((process) => {
    process.stderr.on("data", (data) => {
        // idk why but masscan stdios are stderr
        logger.info(data)
        sendDatatoUI(JSON.stringify({ mode: "Masscan", data: data }))
    })
    process.on("exit", (code, signal) => {
        logger.warn("Process is closed with code: " + code)
        logger.warn(signal)
        serverScanner()
    })
    process.on("disconnect", (err) => {
        logger.error("masscan is disconnected with error: " + err)
    })
})

const getColor = (data, mode) => {
    switch (mode) {
        case "ms":
            if (data >= config.timings.maxresponse) {
                return colors[0]
            }
            else if (data >= config.timings.avgresponse) {
                return colors[2]
            }
            else {
                return colors[1]
            }
        case "status":
            if (data.extra > 5) {
                return colors[0] + "Down"
            } else {
                if (data.data === 0) {
                    return colors[2] + "Idle"
                }
                else if (data.data >= 1) {
                    return colors[1] + "Working"
                }
                else {
                    return colors[0] + "Error"
                }
            }
        default:
            return null
    }
}

const sendDatatoUI = (data) => {
    if (config.UI.enable) {
        ws.send(data)
    }
}

const sendIPtoProcess = (data) => {
    assignedList.sort((a, b) => { return a[1].assigned - b[1].assigned })
    var x = 0
    while (assignedList[x][1]?.currentPings > 5 && x < os.availableParallelism()) {
        x++
    }
    if (x === os.availableParallelism()) {
        logger.fatal("All Processes are down!")
    }
    else {
        try {
        processList[assignedList[x][0]][0].send({ mode: "search", ip: data.ip, ports: data.ports, time: Date.now() })
        processList[assignedList[x][0]][1].push(data.ip)
        logger.debug(processList[assignedList[x][0]][0].pid + " assigned to " + data.ip)
        assignedList[x][1].assigned++
        assignedList[x][1].total++
        currData.lastIp = data.ip
        currData.total++
        currData.assigned++
        }
        catch {
            crashedList.push(data)
        }
    }
}

const createProcessConnection = (i) => {
    processList[i][0].on("message", (data) => {
        var x = assignedList.findIndex((sarray) => {
            const [number] = sarray
            return number === parseInt(data.thread)
        })
        if (data.status === "success") {
            currData.finds++
            currData.assigned--
            assignedList[x][1].finds++
            assignedList[x][1].assigned--
            assignedList[x][1].lastresponsetext = parseInt(Date.now()) - data.time
            assignedList[x][1].currentIp = data.ip
            var y = processList[assignedList[x][0]][1].findIndex((sarray) => {
                const [number] = sarray
                return number === data.ip
            })
            processList[assignedList[x][0]][1].splice(y, 1)
            logger.debug(processList[assignedList[x][0]][0].pid + " processed data from ip: " + assignedList[x][1].currentIp);
        }
        else if (data.status === "error") {
            currData.assigned--
            assignedList[x][1].assigned--
            assignedList[x][1].lastresponsetext = parseInt(Date.now()) - data.time
            assignedList[x][1].currentIp = data.ip
            var y = processList[assignedList[x][0]][1].findIndex((sarray) => {
                const [number] = sarray
                return number === data.ip
            })
            processList[assignedList[x][0]][1].splice(y, 1)
            logger.debug(processList[assignedList[x][0]][0].pid + " failed to processing ip: " + assignedList[x][1].currentIp);
        }
        else if (data.status === "ping") {
            assignedList[x][1].currentPings = 0
            logger.debug(processList[assignedList[x][0]][0].pid + " responded to ping request.")
        }
    })
}

const serverScanner = async () => {
    server.listen(servport, function () {
        logger.info("Server listening on " + servport)
        logger.info("There is " + os.availableParallelism() + " thread available on this server.")
        currData.subprocesses = os.availableParallelism()
        for (var i = 0; i < os.availableParallelism(); i++) {
            processList.push([cprocess.fork("./libs/thread.mjs", [i]), []])
            logger.debug("Process: " + processList[i][0].pid + " started")
            assignedList.push([i, { currentIp: "", lastresponsetext: 0, status: "Idle", assigned: 0, finds: 0, total: 0, currentPings: 0, restarts: 0 }])
        }
        for (var i = 0; i < processList.length; i++) {
            createProcessConnection(i)
        }
        logger.info("Parser will be started in 3 seconds...")
        setTimeout(() => {
            startProcess(`java -Xmx${config.scanner.parserMaxRam}G -jar ` + process.cwd() + '/libs/copenJSParser-1.3-DEV.jar')
            setInterval(async () => {
                assignedList.sort((a, b) => { return a[0] - b[0] })
                let defaultText = `Main Process: \n   Current IP/s: ${(currData.total - currData.totalLast) * 2} IP/s \n   Total Assigned: ${currData.assigned} \n   Total TCP Restarts: ${currData.tcpRestarts} \n   Total Finds & Total Try: ${currData.finds} & ${currData.total} \n   Current Rate: ${((currData.finds / currData.total) * 100).toFixed(2)}% \n   Total Sub-Processes: ${currData.subprocesses} \n   Current IP: ${currData.lastIp} \nSub-Processes: `
                assignedList.forEach(async (data, n) => {
                    defaultText += "\n   Process processNumber: Current IP: currentIP Last Response: lastResponseText Status: statusText Total Assigned: assignedInt Total Finds: findInt Restarts: restartInt Responseless Pings: pingInt ".replace("processNumber", n.toString()).replace("findInt", data[1].finds).replace("assignedInt", data[1].assigned).replace("currentIP", data[1].currentIp).replace("lastResponseText", `${getColor(data[1].lastresponsetext, "ms")}${data[1].lastresponsetext}ms\x1b[0m`).replace("statusText", `${getColor({ data: data[1].assigned, extra: data[1].currentPings }, "status")}\x1b[0m`).replace("restartInt", data[1].restarts).replace("pingInt", data[1].currentPings)
                })
                let temp = []
                assignedList.forEach((data) => {
                    temp.push(data[1])
                })
                sendDatatoUI(JSON.stringify({ mode: "copenJS", main: currData, subproc: temp }))
                text.text = defaultText
                currData.totalLast = currData.total
            }, 500)
            setTimeout(() => {
                text.start()
            }, 1000)
            setInterval(async () => {
                for (var i = 0; i < processList.length; i++) {
                    if (assignedList[i][1].currentPings < 6) {
                        assignedList[i][1].currentPings++
                        processList[assignedList[i][0]][0].send({ mode: "ping", time: Date.now() })
                    }
                    else {
                        logger.warn(processList[assignedList[i][0]][0].pid + " didnt responded ping requests for an entire minute.")
                    }
                }
            }, 10000)
            setInterval(async () => {
                for (var i = 0; i < processList.length; i++) {
                    if (assignedList[i][1].currentPings > 5) {
                        logger.info("Restarting Thread: " + assignedList[i][0]),
                            processList[assignedList[i][0]][0].kill("SIGINT")
                        processList[assignedList[i][0]][0] = cprocess.fork("./libs/thread.mjs", [assignedList[i][0]])
                        assignedList[i][1].restarts++
                        processList[assignedList[i][0]][1].shift()
                        currData.assigned -= assignedList[i][1].assigned
                        currData.crashedTotal += assignedList[i][1].assigned
                        assignedList[i][1].assigned = 0
                        createProcessConnection(assignedList[i][0])
                        crashedList.push(processList[assignedList[i][0]][1])
                        processList[assignedList[i][0]][1] = []
                        assignedList[i][1].currentPings = 0
                    }
                }
            }, 30000)
        }, 3000)
    })
    server.on("connection", function (socket) {
        socket.on('error', function (err) {
            logger.warn("The client lost the connection " + err)
            startProcess(`java -Xmx${config.scanner.parserMaxRam}G -jar ` + process.cwd() + `/libs/copenJSParser-1.3-DEV.jar "${process.cwd().split("src") + "scan.json"}" 0 "` + currData.lastIp + '"')
            currData.tcpRestarts++
        })
        socket.on('end', function () {
            logger.warn("The client end")
            if (!crashedList.length == 0) {
                logger.info("There is a list of ips that sent to the processes which is crashed. Re-running " + currData.crashedTotal + " ips.")
                currData.crashedTotal = 0
                var crashProc = cprocess.fork("./libs/crash.js")
                crashProc.send({ list: crashedList })
                crashProc.on("exit", () => {})
                crashedList = []
            }
        })
        socket.on("data", async function (ip) {
            if (ip.toString().split("}").length > 2 && ip.toString().split("}").length == 1) {
                logger.debug("Received compromised data from client. Checking if its recoverable.")
                compromisedList.push(ip.toString())
            } else if (ip.toString().split("}").length == 2) {
                sendIPtoProcess(JSON.parse(ip.toString()))
            }
        })
    })
}

const startProcess = async (startup, cwd) => {
    cwd = cwd || process.cwd()
    return exec(startup, { cwd: cwd, maxBuffer: config.scanner.processMaxBuffer * 1024 * 1024 * 1024 })
}

const Main = async () => {
    switch (config.scanner.mode) {
        case "default":
            startProcess("masscan").then((data) => {
                data.stdout.on("data", (data) => {
                    logger.debug(data)
                    if (data.includes("usage: masscan") && data.includes("examples:")) {
                        logger.debug("masscan is detected.")
                        masscanStatus = true
                    }
                })
                data.on("exit", () => {
                    logger.debug("Alias check ended")
                    if (!masscanStatus) {
                        logger.info("masscan is not detected trying to install masscan with JDK 17")
                        startProcess("sudo apt-get --assume-yes install git make gcc openjdk-17-jdk openjdk-17-jre && git clone https://github.com/robertdavidgraham/masscan && cd masscan && make && make install && install -pDm755 bin/masscan /usr/bin/masscan && cd .. && masscan", (process.cwd().split("/src")[0])).then((data) => {
                            data.stdout.on("data", (data) => {
                                logger.debug(data)
                                if (data.includes("usage: masscan") && data.includes("examples:")) {
                                    logger.info("Installation of masscan is successful!")
                                    masscanStatus = true
                                }
                            })
                            data.on("exit", () => {
                                logger.debug("Install process is ended")
                                if (!masscanStatus) {
                                    logger.error("An error occured while installing masscan! Please install it manually with jdk17 and select mode masscan")
                                }
                                else {
                                    logger.debug("Starting masscan")
                                    startMasscan()
                                }
                            })
                        })
                    }
                    else {
                        logger.debug("Starting masscan")
                        startMasscan()
                    }
                })
            })
            break;
        case "masscan":
            logger.debug("Starting masscan")
            startMasscan()
            break;
        case "server":
            logger.debug("Starting Server Scanner")
            serverScanner()
            break;
        default:
            logger.error("Invalid mode! Please check your config.json file.")
    }
}

if (config.UI.enable) {
    var i = 0
    startProcess("sudo node server.mjs", process.cwd().split("/src")[0] + "/webUI").then((process) => {
        process.stdout.on("data", (data) => {
            logger.info(data)
            if (i == 0) {
                i++
                ws = new WebSocket("ws://localhost:" + config.UI.websocket)
                ws.onopen = () => {
                    sendDatatoUI("server")
                    Main()
                }
            }
        })
    })
} else Main()