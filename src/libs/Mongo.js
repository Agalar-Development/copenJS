const {
    MongoClient
} = require('mongodb');
const System = require('./Log.js');
const config = require('../config.json');
const client = new MongoClient(config.Scanner.mongolink)
const db = client.db("Scanner")

function Connect() {
    try {
        client.connect()
        System.Log("green", "Successfully connected to MongoDB via Library.");
    } catch (err) {
        System.Log("red", "Failed to connect to MongoDB.");
        console.log(err)
    }
}
async function MongoLogger(data, collection) {
    var cbase = db.collection(collection)
    var result = await cbase.find({
        IP: data.IP,
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

<<<<<<< HEAD
<<<<<<< HEAD
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

async function mongoUpdate(filter, data, collection) {
    var cbase = db.collection(collection)
    return await cbase.updateOne(filter, data).then(result => result)
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
    checkUserAgent,
    mongoUpdate
}
=======
module.exports.MongoFind = MongoFind
module.exports.MongoLogger = MongoLogger;
module.exports.MongoDBWrite = MongoDBWrite;
module.exports.Connect = Connect;
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
=======
module.exports.MongoFind = MongoFind
module.exports.MongoLogger = MongoLogger;
module.exports.MongoDBWrite = MongoDBWrite;
module.exports.Connect = Connect;
>>>>>>> parent of 9fac3b7 (Merge pull request #10 from Agalar-Development/dev)
