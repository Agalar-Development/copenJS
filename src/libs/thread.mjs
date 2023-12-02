import protocol from './Protocol.js'
import webhook from './webhookHelper.mjs'
import Database from './Mongo.js'
import axios from "axios"

const currentThread = process.argv[2]

console.log("Thread " + currentThread + " started")
process.on("message", (data) => {
    var time = data.time
    switch (data.mode) {
        case "ping":
            process.send({status: "ping", thread: currentThread, time: time })
            break;
        case "search":
            var ip = data.ip
            try {
                protocol.GetServerData(ip.toString(), 25565).then(async (data) => {
                    var ipAPI = await axios.get(`http://ip-api.com/json/${ip.toString()}?fields=status,message,country,countryCode,region,city,district,zip,lat,lon,timezone,isp,org,as,asname,proxy,hosting`)
                    try {
                        process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time })
                        if (data.players.online > 0) await webhook(ip.toString(), data.version.name, await protocol.ProtocolTOVersion(data.version.protocol), "Full motd data will be in released with database. ", data.latency, "https://media.minecraftforum.net/attachments/300/619/636977108000120237.png", new Date().toISOString(), data.players.max, data.players.online, ((data.modinfo?.type ?? false) === "FML") ? true : false, ipAPI.data?.countryCode ?? null)
                        Database.MongoLogger({
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
                            Players: data.players.sample,
                            Modinfo: data.modinfo,
                            ipAPI: ipAPI.data
                        }, "Servers")
                    }
                    catch (err) {
                        //    console.log(err)
                        //    console.log("This servers data is compromised IP: " + ip.toString())
                        Database.MongoLogger({
                            IP: ip.toString(),
                            Timestamp: new Date().toISOString()
                        }, "Compromised-Servers")
                        process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time })
                    }
                }).catch((err) => {
                    //console.log(err)
                    process.send({ ip: ip.toString(), status: "error", thread: currentThread, time: time })
                })
            } catch (err) {
                console.log("An unknown error occured")
                //console.log(err)
                process.send({ ip: ip.toString(), status: "error", thread: currentThread, time: time })
            }
            break;
        default:
            return 0
    }
})

Database.Connect()
