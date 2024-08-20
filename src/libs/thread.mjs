import protocol from './Protocol.js'
import webhook from './webhookHelper.mjs'
import Database from './Mongo.js'
<<<<<<< HEAD
<<<<<<< HEAD
import iplookup from './iplookup.mjs'
=======
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
=======
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)

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
<<<<<<< HEAD
<<<<<<< HEAD
            var ports = data.ports
            ports.forEach((port) => {
                try {
                    protocol.GetServerData(ip.toString(), port).then(async (data) => {
                        var ipAPI = iplookup.database.get(ip.toString())
                        try {
                            process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time })
                            if (data.players.online > 0) await webhook(ip.toString() + `:${port}`, data.version.name, await protocol.ProtocolTOVersion(data.version.protocol), "Full motd data will be in released with database. ", data.latency, (data.favicon !== undefined) ? `https://api.mcsrvstat.us/icon/${ip.toString()}:${port}` : "https://media.minecraftforum.net/attachments/300/619/636977108000120237.png", new Date().toISOString(), data.players.max, data.players.online, ((data.modinfo?.type ?? false) === "FML") ? true : false, ipAPI?.countryCode ?? null)
                            Database.MongoLogger({
                                ip: ip.toString(),
                                ports: port,
                                version: data.version.name,
                                protocol: data.version.protocol,
                                protocolVersion: await protocol.ProtocolTOVersion(data.version.protocol),
                                motd: data.description,
                                latency: data.latency,
                                favicon: data.favicon,
                                timestamp: new Date().toISOString(),
                                maxPlayer: data.players.max,
                                onlinePlayer: data.players.online,
                                players: data.players.sample,
                                modinfo: data.modinfo,
                                ipAPI: ipAPI,
                            }, "Servers")
                        }
                        catch (err) {
                            //    console.log(err)
                            //    console.log("This servers data is compromised IP: " + ip.toString())
                            Database.MongoLogger({
                                ip: ip.toString(),
                                timestamp: new Date().toISOString()
                            }, "Compromised-Servers")
                            process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time })
                        }
                    }).catch((err) => {
                        //console.log(err)
                        process.send({ ip: ip.toString(), status: "error", thread: currentThread, time: time })
                    })
                } catch (err) {
                    console.log("An unknown error occured")
=======
=======
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
            try {
                protocol.GetServerData(ip.toString(), 25565).then(async (data) => {
                    try {
                        process.send({ ip: ip.toString(), status: "success", thread: currentThread, time: time })
                        if (data.players.online > 0) await webhook(ip.toString(), data.version.name, await protocol.ProtocolTOVersion(data.version.protocol), "Full motd data will be in released with database. ", data.latency, "https://minecraft.global/images/icons/default_favicon.png", new Date().toISOString(), data.players.max, data.players.online, ((data.modinfo?.type ?? false) === "FML") ? true : false)
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
                            Modinfo: data.modinfo
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
<<<<<<< HEAD
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
=======
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
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
