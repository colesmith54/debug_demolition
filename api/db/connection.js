const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
});

module.exports = { 
  connectToServer: function() {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      console.log('Connected to MongoDB');
    }).catch((err) => {
      console.log(`Error connecting to MongoDB: ${err}`);
    });
  },

  getDb: function() {
    return client.db('debugbattle');
  }
}