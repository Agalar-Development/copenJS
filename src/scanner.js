const axios = require('axios')
const protocol = require('./libs/Protocol.js')
const config = require('./config.json')
const Database = require('./libs/Mongo.js')
const net = require("net")
const {
    exec
} = require('child_process');

var server = net.createServer()

const webhook = config.Scanner.webhook
const servport = config.Scanner['tcp-servport']

async function WebhookSender(serverip, serverversion, protocolversion, motd, latency, favicon, timestamp, max, online) {
    await axios.post(webhook, {
            username: "copenJS",
            content: "",
            embeds: [{
                type: "rich",
                title: `A new server was found!`,
                description: "",
                color: 0x07f9f9,
                fields: [{
                        name: `Server IP: `,
                        value: serverip,
                        inline: true
                    },
                    {
                        name: `Server Version:`,
                        value: `From Server: ` + serverversion + `\nFrom Protocol Version: ` + protocolversion,
                        inline: true
                    },
                    {
                        name: `Server Motd:`,
                        value: motd,
                        inline: true
                    },
                    {
                        name: `Max Players / Online Players:`,
                        value: max + " / " + online,
                        inline: true
                    },
                    {
                        name: `Players:`,
                        value: `Full player data's will be released when database was finished`,
                    },
                    {
                        name: `Latency to Scanner Server:`,
                        value: latency + `ms`,
                        inline: true
                    },
                ],
                thumbnail: {
                    url: favicon,
                    height: 0,
                    width: 0
                },
                timestamp: timestamp,
                footer: {
                    text: `Made By CrawLeyYou`
                }
            }]
        })
        .then(function (response) {
            console.log("Webhook Succesfully Sended!")
        })
        .catch(function (error) {
            console.log("A error occurred while sending webhook.");
            console.log(error)
        });
}

const Main = async () => {
    server.listen(servport, function () {
        console.log("Server listening on " + servport)
        console.log("Parser will be started in 3 seconds...")
       setTimeout(startParser, 3000)
    })
    server.on("connection", function (socket) {
        socket.on('error', function (err) {
            console.log("Client lost connection")
        })
        socket.on('end', function () {
            console.log("Client disconnected")
        })
        socket.on("data", async function (ip) {
            try {
                protocol.GetServerData(ip.toString(), 25565).then(async (data) => {
                    try {
                        console.log("There is a server in this ip " + ip.toString())
                        await WebhookSender(ip.toString(), data.version.name, await protocol.ProtocolTOVersion(data.version.protocol), "Full motd data will be in released with database. ", data.latency, "https://minecraft.global/images/icons/default_favicon.png", new Date().toISOString(), data.players.max, data.players.online)
                        await Database.MongoLogger({
                            IP: ip.toString(),
                            Version: data.version.name,
                            Protocol: data.version.protocol,
                            ProtocolVersion: await protocol.ProtocolTOVersion(data.version.protocol),
                            Motd: data.description,
                            Latency: data.latency,
                            Favicon: data.favicon,
                            Timestamp: new Date().toISOString(),
                            MaxPlayer: data.players.max,
                            OnlinePlayer: data.players.online,
                            Players: data.players.sample
                        }, "Servers")
                    }
                    catch (err) {
                        console.log("This servers data is compromised IP: " + ip.toString())
                        await Database.MongoLogger({
                            IP: ip.toString(),
                            Timestamp: new Date().toISOString()
                        }, "Compromised-Servers")
                    }
                }).catch((err) => {
                       
                })
            } catch (err) {
                console.log("An unknown error occured")
                console.log(err)
            }
    })
    })
}

const startParser = async () => {
    exec('java -Xmx4096m -jar ' + __dirname + '/libs/copenJSParser-1.0-SNAPSHOT.jar', (error, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.error(`stderr: ${stderr}`);
    })
}

Database.Connect()
Main()
