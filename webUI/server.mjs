import express from "express"
import config from "../src/config.json" assert { type: "json" }
import { WebSocketServer, WebSocket } from 'ws';
import motdParser from "@sfirew/minecraft-motd-parser"
import database from "../src/libs/Mongo.js"

var wss = new WebSocketServer({ port: config.UI.websocket })

database.Connect().then(() => {
    wss.on("listening", () => {
        console.log("Websocket listening on port " + config.UI.websocket)
        app.listen(config.UI.web.listen, () => {
            console.log("Web UI listening on port " + config.UI.web.listen)
        })
    })
})
let server

const pushClients = (wsc, msg) => {
    wsc.removeListener("message", pushClients)
    if (msg.toString() === "server" && server === undefined) {
        server = wsc
        establishConn()
    }
}

const establishConn = () => {
    server.on("message", (msg) => {
        wss.clients.forEach((client) => {
            if (client !== server && client.readyState === WebSocket.OPEN) {
                client.send(msg.toString())
            }
        })
    })
    server.on("close", () => {
        server = undefined
    })
}

wss.on('connection', (wsc) => {
    wsc.on('message', (msg) => pushClients(wsc, msg))
})

var app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(process.cwd() + "/public/static"))
app.use(express.static(process.cwd() + "/public/assets"))

app.disable("x-powered-by")

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html")
})

app.get("/api/socket", (req, res) => {
    res.status(200).send(btoa(JSON.stringify({ wsp: config.UI.websocket })))
})

app.post("/api/database/fetch", async (req, res) => {
    var temp = []
    await database.fetchRandom("Servers").then(async (resp) => {
        resp.forEach((data) => {
            temp.push({ favicon: data.favicon, motdHTML: (data.motd == null) ? null : motdParser.JSONToHTML(data.motd), ip: data.ip, version: data.version, protocolversion: data.protocolVersion, latency: (data.latency == null) ? 0 : data.latency, currentplayers: data.onlinePlayer, maxplayers: data.maxPlayer })
        })
    }).finally(() => {
        res.status(200).jsonp({data: temp})
    })
})

app.get("/api/database/stats", async (req, res) =>{
    res.status(200).jsonp(await database.stats())
})

app.all("*", (req, res) => {
    res.status(404).send("404 Not Found")
})