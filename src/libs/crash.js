const config = require("../config.json").scanner

async function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

const net = require('net');
let globalList;

var client = net.createConnection({ port: config["tcp-servport"] }, async function () {
    console.log('Connected');
    globalList.forEach((array) => {
        array.forEach((ip) => {
            client.write(ip);
            sleep(5)
        })
    })
    process.kill(config["tcp-servport"])
});

process.on('message', (data) => {
    globalList = data.list
})