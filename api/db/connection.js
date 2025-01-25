const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = { 
  connectToServer: () => {
    mongoose.connect(uri).then(() => {
      console.log('Connected to MongoDB');
    }).catch((err) => {
      console.log(`Error connecting to MongoDB: ${err}`);
    });
  },

  getDb: () => {
    return client.db('debugbattle');
  }
}