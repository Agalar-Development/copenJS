const protocol = require('minecraft-protocol')
const mcdata = require('minecraft-data')
let version;
const net = require('node:net');
const zlib = require('zlib')

let compressionThreshold = -1

const GetServerData = (ip, port) => new Promise(async (resolve, reject) => {
    try {
        await protocol.ping({
            host: ip,
            port: port
        }).then(async (data) => {
            let localData = data
            if (data.players.online == 0) await checkOnlineStatus(ip.toString(), port).then(async (response) => {
                localData.isOnlineMode = response
            })
            resolve(localData)
        }).catch((err) => {
            reject("error")
        })
    } catch (err) {
        reject("error")
    }
})

function writeVarInt(value) {
    const bytes = [];
    while (true) {
        if ((value & 0xFFFFFF80) === 0) {
            bytes.push(value);
            break;
        }
        bytes.push((value & 0x7F) | 0x80);
        value >>>= 7;
    }
    return Buffer.from(bytes);
}

function readVarInt(buffer, offset = 0) {
    let value = 0;
    let position = 0;
    let currentByte;
    let bytesRead = 0;

    while (true) {
        currentByte = buffer[offset + bytesRead];
        bytesRead++;

        value |= (currentByte & 0x7F) << position;

        if ((currentByte & 0x80) === 0) break;

        position += 7;
        if (position >= 32) throw new Error("VarInt too big");
    }

    return { value, size: bytesRead };
}

const createPacketWithoutCompression = async (id, data) => new Promise((resolve, reject) => {
    var packetID = writeVarInt(id);
    var length = writeVarInt(packetID.byteLength + data.length);
    resolve(Buffer.concat([length, packetID, data]));
})

const ProtocolTOVersion = async (protocol) => new Promise((resolve, reject) => {
    mcdata.versions.pc.forEach(async (data) => {
        if (data.version == protocol) {
            version = data.minecraftVersion
        }
    })
    resolve(version)
})

const checkOnlineStatus = async (ip, port) => new Promise(async (resolve, reject) => {
    const socket = net.createConnection({ host: ip, port: port }, async () => {
        var portBuffer = Buffer.alloc(2)
        portBuffer.writeUInt16BE(port)
        await createPacketWithoutCompression(0x00, Buffer.concat([
            writeVarInt(754),
            writeVarInt(ip.length),
            Buffer.from(ip),
            portBuffer,
            writeVarInt(2)
        ]))
            .then(async (packet) => {
                socket.write(packet)
            })
        await createPacketWithoutCompression(0x00, Buffer.concat([
            writeVarInt("copenJSv2".length),
            Buffer.from("copenJSv2")
        ])).then(async (packet) => {
            socket.write(packet)
        })
    })
    socket.on('error', () => {
        resolve(null)
    })
    let receiveBuffer = Buffer.alloc(0);

    socket.on('data', (data) => {
        receiveBuffer = Buffer.concat([receiveBuffer, data])

        while (true) {
            if (receiveBuffer.length === 0) return

            const lengthInfo = readVarInt(receiveBuffer)
            if (receiveBuffer.length < lengthInfo.size + lengthInfo.value) return

            const packetBody = receiveBuffer.slice(
                lengthInfo.size,
                lengthInfo.size + lengthInfo.value
            )

            let payload

            if (compressionThreshold >= 0) {
                const dataLengthInfo = readVarInt(packetBody, 0)
                let offset = dataLengthInfo.size
                const data = packetBody.slice(offset)

                if (dataLengthInfo.value !== 0) {
                    payload = zlib.inflateSync(data)
                } else {
                    payload = data
                }
            } else {
                payload = packetBody
            }

            const packetIdInfo = readVarInt(payload, 0)
            const packetId = packetIdInfo.value
            const packetData = payload.slice(packetIdInfo.size)

            if (packetId === 0x03) {
                compressionThreshold = readVarInt(packetData, 0).value
            }

            else if (packetId === 0x01) {
                socket.end()
                resolve(true)
                return
            }

            else if (packetId === 0x02) {
                socket.end()
                resolve(false)
                return
            }

            receiveBuffer = receiveBuffer.slice(
                lengthInfo.size + lengthInfo.value
            )
        }
    })
    socket.on('end', () => {
        resolve(null)
    })
})

module.exports = {
    GetServerData,
    ProtocolTOVersion,
    checkOnlineStatus
}
