const { exec } = require('child_process');
const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 7001;
const fs = require('fs');
const csv = require('csv-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require("./db/connection")
const User = require("./models/user")

const WebSocket = require('ws');
const { hash } = require('crypto');

const server = app.listen(port, () => {
  db.connectToServer((err) => {
    if (err) console.log(err);
    else console.log(`Connected to MongoDB`);
  });
  console.log(`Server listening at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('WebSocket connected');
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });
});

wss.on('error', (err) => {
  console.error('WebSocket error:', err);
});

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

const hashStringToInt = (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash) % 10;
}


// {
//   roomId: {
//     members: [p1, p2],
//   }
// }
let rooms = new Map();

class Player {
  constructor(ws, elo, username, wins, losses) {
    this.ws = ws;
    this.elo = elo;
    this.username = username;
    this.wins = wins;
    this.losses = losses;
  }
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    console.log(msg);

    if (msg.status === 'create-room') {
      const roomId = generateCode();
      rooms.set(roomId, {
        members: [new Player(ws, msg.elo, msg.username, msg.wins, msg.losses)],
        finished: false
      });

      // TODO: associate the room with a debug problem

      ws.send(JSON.stringify({ status: 'room-created', roomId: roomId }));
      setTimeout(() => {
        if (rooms.has(roomId) && rooms.get(roomId).members.length < 2) {
          rooms.delete(roomId);
          ws.send(JSON.stringify({ status: 'room-expired' }));
        }
      }, 300000);
    }

    if (msg.status === 'join-room') {
      const roomId = msg.roomId;
      rooms.get(roomId).members.push(new Player(ws, msg.elo, msg.username, msg.wins, msg.losses));
      const url = `/game/${roomId}`;

      rooms.get(roomId).members.forEach((p) => {
        // TODO: send problem state
        p.ws.send(JSON.stringify({ status: 'game-start', url: url }));
      });

      setTimeout(() => {
        if (rooms.has(roomId)) {
          rooms.delete(roomId);
          ws.send(JSON.stringify({ status: 'room-expired' }));
        }
      }, 7200000);
    }

    if (msg.status === 'game-end') {
      const roomId = msg.roomId;
      rooms.get(roomId).finished = true;

      let winner = null;
      let loser = null;

      if (msg.result === 'win') {
        winner = rooms.get(roomId).members[0];
        loser = rooms.get(roomId).members[1];
      } else if (msg.result === 'lose') {
        winner = rooms.get(roomId).members[1];
        loser = rooms.get(roomId).members[0];
      }

      updateELO(winner, loser);

      try {
        User.updateOne({ username: winner.username }, { elo: winner.elo, wins: winner.wins, losses: winner.losses });
        User.updateOne({ username: loser.username }, { elo: loser.elo, wins: loser.wins, losses: loser.losses });
      } catch (err) {
        console.log(err);
      }

      winner.ws.send(JSON.stringify({ status: 'game-won', elo: winner.elo, wins: winner.wins, losses: winner.losses }));
      loser.ws.send(JSON.stringify({ status: 'game-lost', elo: loser.elo, wins: loser.wins, losses: loser.losses }));
    }

    if (msg.status === 'code-submission') {
      const roomId = msg.roomId;
      const player = rooms.get(roomId).members.find((p) => p.ws === ws);

      const code = msg.code;
      const command = `python script.py ${code}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${stderr}`);
          return;
        }
        
        const outputLines = stdout.split('\n');
        const status = outputLines[0];
        const output = outputLines.slice(1).join('\n');

        if (status === 'accepted') {
          const winner = player;
          const loser = rooms.get(roomId).members.find((p) => p.ws !== ws);

          updateELO(winner, loser);

          try {
            User.updateOne({ username: winner.username }, { elo: winner.elo, wins: winner.wins, losses: winner.losses });
            User.updateOne({ username: loser.username }, { elo: loser.elo, wins: loser.wins, losses: loser.losses });
          } catch (err) {
            console.log(err);
          }

          winner.ws.send(JSON.stringify({ status: 'game-won', elo: winner.elo, wins: winner.wins, losses: winner.losses }));
          loser.ws.send(JSON.stringify({ status: 'game-lost', elo: loser.elo, wins: loser.wins, losses: loser.losses }));

          rooms.delete(roomId);
        } else {
         player.ws.send(JSON.stringify({ status: 'code-incorrect', output: output }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    rooms.forEach((room, roomId) => {
      if (room.members.find((p) => p.ws === ws)) {
        const winner = room.members.find((p) => p.ws !== ws);
        const loser = room.members.find((p) => p.ws === ws);

        updateELO(winner, loser);

        try {
          User.updateOne({ username: winner.username }, { elo: winner.elo, wins: winner.wins, losses: winner.losses });
          User.updateOne({ username: loser.username }, { elo: loser.elo, wins: loser.wins, losses: loser.losses });
        } catch (err) {
          console.log(err);
        }

        winner.ws.send(JSON.stringify({ status: 'game-won', elo: winner.elo, wins: winner.wins, losses: winner.losses }));
        loser.ws.send(JSON.stringify({ status: 'game-lost', elo: loser.elo, wins: loser.wins, losses: loser.losses }));

        rooms.delete(roomId);
      }
    });
  });
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});