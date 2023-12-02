import axios from "axios"
import config from '../config.json' assert { type: "json" }
const webhook = config.scanner.webhook

async function WebhookSender(serverip, serverversion, protocolversion, motd, latency, favicon, timestamp, max, online, mod, country) {
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
                        name: `Modded:`,
                        value: mod,
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
                    {
                        name: `Country:`,
                        value: `:flag_` + country.toLowerCase() + `: ` + country,
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

export default WebhookSender