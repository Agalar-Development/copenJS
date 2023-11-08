import protocol from './Protocol.js'
import webhook from './webhookHelper.mjs'
import Database from './Mongo.js'

const currentThread = process.argv[2]

console.log("Thread " + currentThread + " started")
process.on("message", (data) => {
    var ip = data.ip
    var time = data.time
     try {
        protocol.GetServerData(ip.toString(), 25565).then(async (data) => {
            try {
                process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time})
                if (data.players.online > 0 ) await webhook(ip.toString(), data.version.name, await protocol.ProtocolTOVersion(data.version.protocol), "Full motd data will be in released with database. ", data.latency, "https://minecraft.global/images/icons/default_favicon.png", new Date().toISOString(), data.players.max, data.players.online, ((data.modinfo?.type ?? false) === "FML") ? true : false)
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
                    Players: data.players.sample,
                    Modinfo: data.modinfo
                }, "Servers")
            }
            catch (err) {
                console.log(err)
                console.log("This servers data is compromised IP: " + ip.toString())
                await Database.MongoLogger({
                    IP: ip.toString(),
                    Timestamp: new Date().toISOString()
                }, "Compromised-Servers")
                process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time})
            }
        }).catch((err) => {
            process.send({ ip: ip.toString(), status: "error", thread: currentThread, time: time})
        })
    } catch (err) {
        console.log("An unknown error occured")
        console.log(err)
        process.send({ ip: ip.toString(), status: "error", thread: currentThread, time: time})
    }
})

Database.Connect()