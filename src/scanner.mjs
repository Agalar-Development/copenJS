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
    appenders: { copenjs: { type: "file", filename: process.cwd() + "/logs/" + Date.now() + ".log" } },
    categories: { default: { appenders: ["copenjs"], level: "debug" } },
});
var logger = log4js.getLogger("copenJS");
var server = net.createServer()

const servport = config.Scanner['tcp-servport']

let currData = {
    lastIp: "",
    tcpRestarts: 0,
    total: 0,
    finds: 0,
    subprocesses: 0,
    assigned: 0,
    totalLast: 0
}

var colors = ["\x1b[31m", "\x1b[32m", "\x1b[33m"]

let processList = []
let assignedList = []
var text = ora()
text.spinner = spinners.dots13

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
            assignedList[x][1].finds++
            decreaseData(x, data)
            logger.debug(processList[assignedList[x][0]][0].pid + " processed data from ip: " + assignedList[x][1].currentIp);
        }
        else if (data.status === "error") {
            decreaseData(x, data)
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
        console.log("Parser will be started in 3 seconds...")
        setTimeout(() => {
            startParser('java -Xmx5G -jar ' + process.cwd() + '/libs/copenJSParser-1.0-SNAPSHOT-5ms.jar')
            setInterval(async () => {
                assignedList.sort((a, b) => { return a[0] - b[0] })
                let defaultText = `Main Process: \n   Current IP/s: ${(currData.total - currData.totalLast) * 2} IP/s \n   Total Assigned: ${currData.assigned} \n   Total TCP Restarts: ${currData.tcpRestarts} \n   Total Finds & Total Try: ${currData.finds} & ${currData.total} \n   Current Rate: ${((currData.finds / currData.total) * 100).toFixed(2)}% \n   Total Sub-Processes: ${currData.subprocesses} \n   Current IP: ${currData.lastIp} \nSub-Processes: `
                assignedList.forEach(async (data, n) => {
                    defaultText += "\n   Process processNumber: Current IP: currentIP Last Response: lastResponseText Status: statusText Total Assigned: assignedInt Total Finds: findInt Restarts: restartInt Responseless Pings: pingInt ".replace("processNumber", n.toString()).replace("findInt", data[1].finds).replace("assignedInt", data[1].assigned).replace("currentIP", data[1].currentIp).replace("lastResponseText", `${getColor(data[1].lastresponsetext, "ms")}${data[1].lastresponsetext}ms\x1b[0m`).replace("statusText", `${getColor({ data: data[1].assigned, extra: data[1].currentPings }, "status")}\x1b[0m`).replace("restartInt", data[1].restarts).replace("pingInt", data[1].currentPings)
                })
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
                        assignedList[i][1].assigned--
                        currData.assigned--
                        createProcessConnection(assignedList[i][0])
                        processList[assignedList[i][0]][1].forEach((data) => {
                            processList[assignedList[i][0]][0].send({ mode: "search", ip: data, time: Date.now() })
                            processList[assignedList[i][0]][1].shift()
                        });
                        assignedList[i][1].currentPings = 0
                    }
                }
            }, 30000)
        }, 3000)
    })
    server.on("connection", function (socket) {
        socket.on('error', function (err) {
            console.log("Client lost connection")
            logger.warn("The client lost the connection " + err)
            startParser('java -Xmx5G -jar ' + process.cwd() + `/libs/copenJSParser-1.0-SNAPSHOT-5ms.jar "${process.cwd().split("src") + "scan.json"}" 0 "` + currData.lastIp + '"')
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
            assignedList.sort((a, b) => { return a[1].assigned - b[1].assigned })
            var x = 0
            while (assignedList[x][1]?.currentPings > 5 && x < os.availableParallelism()) {
                x++
            }
            if (x === os.availableParallelism()) {
                logger.fatal("All Processes are down!")
            }
            else {
                processList[assignedList[x][0]][0].send({ mode: "search", ip: ip.toString(), time: Date.now() })
                processList[assignedList[x][0]][1].push(ip.toString())
                logger.debug(processList[assignedList[x][0]][0].pid + " assigned to " + ip.toString());
                assignedList[x][1].assigned++
                assignedList[x][1].total++
                currData.lastIp = ip.toString()
                currData.total++
                currData.assigned++
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