const {
    MongoClient
} = require('mongodb');
const System = require('./Log.js');
const config = require('../config.json');
var connectionString = config.scanner.mongo.endpoint.replace("username", config.scanner.mongo.admin.username).replace("password", config.scanner.mongo.admin.password)
const client = new MongoClient((config.scanner.mongo.srv === true) ? connectionString.replace("mongodb", "mongodb+srv") : connectionString)
const db = client.db("Scanner")

const Connect = () => new Promise((resolve, reject) => {
    try {
        client.connect()
        System.Log("green", "Successfully connected to MongoDB via Library.");
        resolve()
    } catch (err) {
        System.Log("red", "Failed to connect to MongoDB.");
        console.log(err)
        reject()
    }
})
async function MongoLogger(data, collection) {
    var cbase = db.collection(collection)
    var result = await cbase.find({
        ip: data.ip,
    }).toArray().then(result => result[0])
    if (result == undefined) {
        // System.Log("yellow", "No Data found in MongoDB. Inserting Data...");
        MongoDBWrite(data, collection)
    } else {
        //System.Log("yellow", "Server data found in MongoDB. Server IP: " + result.IP);
    }
}

async function MongoDBWrite(data, collection) {
    try {
        //await System.Log("Writing into MongoDB...");
        const cbase = db.collection(collection)
        await cbase.insertOne(data);
    } catch (err) {
        console.log(err.stack);
        await System.Log("red", "An error occured while writing to MongoDB.");
    } finally {
        //await System.Log("green", "Data was written to MongoDB. Keeping Connection alive...");
    }
}

async function MongoFind(data, collection) {
    var cbase = db.collection(collection)
    return await cbase.find(data).toArray().then(result => result[0])
}

async function fetchCustom(data, collection, skip) {
    var cbase = db.collection(collection)
    return await cbase.find(data).skip(skip).limit(20).toArray().then(result => result)
}

async function checkUserAgent(hash) {
    var cbase = db.collection("AllowedAgents")
    return await cbase.find({ hash: `${hash.toString()}` }).collation({ locale: "en", strength: 2 }).toArray().then(result => result[0].hash.toLowerCase() === hash.toLowerCase())
}

async function fetchRandom(collection) {
    var cbase = db.collection(collection)
    return cbase.aggregate([{ $sample: { size: 20 } }]).toArray()
}

const stats = () => db.stats()

module.exports = {
    stats,
    fetchRandom,
    MongoFind,
    MongoDBWrite, 
    MongoLogger, 
    Connect, 
    fetchCustom, 
    checkUserAgent
}