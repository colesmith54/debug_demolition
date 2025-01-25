const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
const fs = require('fs');
const csv = require('csv-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require("./db/connection")
const User = require("./models/user")

const redis = require('redis');
const client = redis.createClient({
  password: rocess.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});
client.on('error', (err) => {
  console.log('Redis error: ' + err);
});

const WebSocket = require('ws');
const server = app.listen(port, () => {
  client.connect().then(() => {
    console.log(`Connected to Redis`);
  });
  db.connectToServer((err) => {
    if (err) console.log(err);
    else console.log(`Connected to MongoDB`);
  });
  console.log(`Server listening at http://localhost:${port}`);
});
const wss = new WebSocket.Server({ server });

const generateCode = () => {
  const n = 6;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < n; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const updateELO = (winner, loser) => {
  const K = 32;
  const R1 = Math.pow(10, winner.elo / 400);
  const R2 = Math.pow(10, loser.elo / 400);
  const E1 = R1 / (R1 + R2);
  const E2 = R2 / (R1 + R2);
  winner.elo += Math.round(K * (1 - E1));
  loser.elo += Math.round(K * (0 - E2));
  winner.wins++;
  loser.losses++;
};

// {
//   roomId: {
//     members: [p1, p2],
//     finished: bool
//   }
// }
let rooms = Map();

class Player {
  constructor(ws, elo, username, wins, losses) {
    this.ws = ws;
    this.elo = elo;
    this.username = username;
    this.wins = wins;
    this.losses = losses;
  }
}