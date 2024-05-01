const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://crawleyyou:lGiaacWODLu25rnL@cluster0.mplhfvy.mongodb.net/';

const client = new MongoClient(url);

const searchPlayers = async (args) => new Promise(async (resolve, reject) => {

  const dbName = 'Scanner';

  const db = client.db(dbName);

  const collection = db.collection('Servers');

  try {

    const namesArray = Array.isArray(args) ? args : [args];

    const regexArray = namesArray.map(name => new RegExp('^' + name + '$', 'i'));

    const result = await collection.find({ 'Players.name': { $in: regexArray } }).toArray();

    if (!result.length || !result[0].Players.length) {
      resolve('Player not found');
      console.log('Player not found');
      return;
    }
    
    console.log(result);
    resolve(result);
  } catch (err) {
    console.error(err);
    reject(err);
  }
});

module.exports = {
    url,
    client,
  searchPlayers
};
