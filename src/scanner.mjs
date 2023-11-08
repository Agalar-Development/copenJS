import config from './config.json' assert { type: "json" }
import net from "net"
import { exec } from "child_process"
import cprocess from "child_process"
import spinners from "cli-spinners"
import ora from 'ora'
import os from "os"

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
            if (data === 0) {
                return colors[2] + "Idle"
            }
            else if (data >= 1) {
                return colors[1] + "Working"
            }
            else {
                return colors[0] + "Error"
            }
        default:
            return null
    }
}

const Main = async () => {
    server.listen(servport, function () {
        console.log("Server listening on " + servport)
        console.log("There is " + os.availableParallelism() + " thread available on this server.")
        currData.subprocesses = os.availableParallelism()
        for (var i = 0; i < os.availableParallelism(); i++) {
            processList.push(cprocess.fork("./libs/thread.mjs", [i]))
            assignedList.push([i, { currentIp: "", lastresponsetext: 0, status: "Idle", assigned: 0, finds: 0, total: 0 }])
        }
        for (var i = 0; i < processList.length; i++) {
            processList[i].on("message", (data) => {
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
                }
                else if (data.status === "error") {
                    currData.assigned--
                    assignedList[x][1].assigned--
                    assignedList[x][1].lastresponsetext = parseInt(Date.now()) - data.time
                }
            })
        }
        console.log("Parser will be started in 3 seconds...")
        setTimeout(() => {
            // startParser()
            setInterval(async () => {
                assignedList.sort((a, b) => { return a[0] - b[0] })
                let defaultText = `Main Process: \n   Current IP/s: ${currData.total - currData.totalLast} IP/s \n   Total Assigned: ${currData.assigned} \n   Total TCP Restarts: ${currData.tcpRestarts} \n   Total Finds & Total Try: ${currData.finds} & ${currData.total} \n   Current Rate: ${((currData.finds / currData.total) * 100).toFixed(2)}% \n   Total Sub-Processes: ${currData.subprocesses} \n   Current IP: ${currData.lastIp} \nSub-Processes: `
                assignedList.forEach(async (data, n) => {
                    defaultText += "\n   Process processNumber: Current IP: currentIP Last Response: lastResponseText Status: statusText Total Assigned: assignedInt Total Finds: findInt ".replace("processNumber", n.toString()).replace("findInt", data[1].finds).replace("assignedInt", data[1].assigned).replace("currentIP", data[1].currentIp).replace("lastResponseText", `${getColor(data[1].lastresponsetext, "ms")}${data[1].lastresponsetext}ms\x1b[0m`).replace("statusText", `${getColor(data[1].assigned, "status")}\x1b[0m`)
                })
                text.text = defaultText
                currData.totalLast = currData.total
            }, 1000)
            setTimeout(() => {
                text.start()
            }, 1000)
        }, 3000)
    })
    server.on("connection", function (socket) {
        socket.on('error', function (err) {
            console.log("Client lost connection")
        })
        socket.on('end', function () {
            console.log("Client disconnected")
        })
        socket.on("data", async function (ip) {
            assignedList.sort((a, b) => { return a[1].assigned - b[1].assigned })
            processList[assignedList[0][0]].send({ ip: ip.toString(), time: Date.now() })
            assignedList[0][1].currentIp = ip.toString()
            assignedList[0][1].assigned++
            assignedList[0][1].total++
            currData.lastIp = ip.toString()
            currData.total++
            currData.assigned++
        })
    })
}

const startParser = async () => {
    exec('java -Xmx4096m -jar ' + process.cwd() + '/libs/copenJSParser-1.0-SNAPSHOT-5ms.jar', (error, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.error(`stderr: ${stderr}`);
    })
}


Main()
