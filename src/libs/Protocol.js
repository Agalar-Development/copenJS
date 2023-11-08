const protocol = require('minecraft-protocol')
const mcdata = require('minecraft-data')
let version;

const GetServerData = (ip, port) => new Promise(async (resolve, reject) => {
    try {
        await protocol.ping({
            host: ip,
            port: port
        }).then((data) => {
            resolve(data)
        }).catch((err) => {
            reject(err)
        })
    } catch (err) {
        reject(err)
    }
})

const ProtocolTOVersion = async (protocol) => new Promise((resolve, reject) => {
    mcdata.versions.pc.forEach(async (data) => {
        if (data.version == protocol) {
            version = data.minecraftVersion
        }
    })
    resolve(version)
})

module.exports = {
    GetServerData,
    ProtocolTOVersion
}
