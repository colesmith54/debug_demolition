const { exec } = require('child_process');
const express = require('express');
const gen_incorrect_code = require('./deepseek/gen');

const cors = require('cors');
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
const port = process.env.PORT || 5000;
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
  if(!winner || !loser) {
    console.log("Winner or loser not found");
    return;
  }
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
  console.log(str);
  let hash = 0;
  const prime = 31;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * prime) + str.charCodeAt(i);
  }
  return Math.abs(hash) % 8;
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

wss.on('connection', async (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log(`Raw message received: ${message}`);
    const msg = JSON.parse(message);

    if (msg.status === 'create-room') {
      console.log('fowjef', msg.username)
      const roomId = generateCode();
      rooms.set(roomId, {
        members: [new Player(ws, msg.elo, msg.username, msg.wins, msg.losses)],
        finished: false
      });
      
      ws.send(JSON.stringify({ status: 'room-created', roomId: roomId }));
      console.log(`Room created with ID: ${roomId}`);

      setTimeout(() => {
        if (rooms.has(roomId) && rooms.get(roomId).members.length < 2) {
          console.log("Deleting room4!")
          rooms.delete(roomId);
          ws.send(JSON.stringify({ status: 'room-expired' }));
        }
      }, 300000);
    }

    if (msg.status === 'join-room') {
      console.log('f', msg.username)
      const roomId = msg.roomId;
      if (!rooms.has(roomId) || rooms.get(roomId).length >= 2 || (rooms.get(roomId).members[0].username === msg.username && msg.username !== '')) {
        if (!rooms.has(roomId)) console.log("Room not found");
        else if (rooms.get(roomId).members.length >= 2) console.log("Room full");
        else if (rooms.get(roomId).members[0].username === msg.username && msg.username !== '') console.log("Username already taken");
        ws.send(JSON.stringify({ status: 'room-not-found' }));
        return;
      }
      
      const room = rooms.get(msg.roomId);
      if (room) {
        room.members.push(new Player(ws, msg.elo, msg.username, msg.wins, msg.losses));
        room.members.forEach((member) => {
          console.log("Sending updated sz to: ", member.username);
          member.ws.send(
            JSON.stringify({
              status: 'room-updated',
              roomId: msg.roomId,
              memberCount: room.members.length,
            })
          );
        });
      }

      const problemId = hashStringToInt(roomId);
      
      fs.createReadStream('./assets/problems.csv')
        .pipe(csv())
        .on('data', async (row) => {
          console.log(Number(row.id));
          console.log(problemId);
          if (Number(row.id) === problemId) {
            const title = row.title;
            const problemDescription = row.html;
            const template = row.function_header;

            console.log("YES");
            const incorrect_code = await gen_incorrect_code(row.html, template)
            console.log("2x YES");

            const members = rooms.get(roomId).members;
            members.forEach((p, i) => {
              p.ws.send(JSON.stringify({
                status: 'game-start',
                title: title,
                problem_description: problemDescription,
                initialCode: incorrect_code,
                opponent: members[1 - i].username
              }))
            })
          }
        })
        .on('end', () => {
          console.log(`Problem with ID ${problemId} queried successfully`);
        })
        .on('error', (err) => {
          console.error('Error reading CSV:', err);
        });

      setTimeout(() => {
        if (rooms.has(roomId)) {
          console.log("Deleting room1!")
          rooms.delete(roomId);
          ws.send(JSON.stringify({ status: 'room-expired' }));
        }
      }, 7200000);
    }

    if (msg.status === 'code-submission') {
      console.log('msg', msg)
      console.log(rooms)
      const roomId = msg.roomId;
      const room = rooms.get(roomId);
      const player = room ? room.members.find((p) => p.username === msg.username) : null;
      console.log(player)

      console.log("things");

      if(!roomId) {
        console.log("Room not found");
        return;
      }

      const code = msg.code;
      const problemId = hashStringToInt(roomId);

      const command = `python3 judge.py ${problemId} "${code}"`;

      console.log(`Executing command: ${command}`);

      setTimeout(() => {
        exec(command, { cwd: './judge/' }, async (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${stderr}`);
            return;
          }
          
          console.log("things1", error, stdout, stderr);
          const data = JSON.parse(stdout);
          // const outputLines = stdout.split('\n');
          // const status = outputLines[0];
          const status = data['failed'].length === 0
          // const output = outputLines.slice(1).join('\n');
          const output = data

          console.log("things2", error, stdout, stderr);
          if (status === 'accepted') {
            const winner = player;
            const loser = rooms.get(roomId).members.find((p) => p.ws !== ws);
  
            console.log("things3", error, stdout, stderr);
            updateELO(winner, loser);
  
            try {
              await User.updateOne({ username: winner.username }, { elo: winner.elo, wins: winner.wins, losses: winner.losses });
              await User.updateOne({ username: loser.username }, { elo: loser.elo, wins: loser.wins, losses: loser.losses });
            } catch (err) {
              console.log(err);
            }
  
            console.log("things4", error, stdout, stderr);
            winner.ws.send(JSON.stringify({ status: 'game-won', elo: winner.elo, wins: winner.wins, losses: winner.losses }));
            loser.ws.send(JSON.stringify({ status: 'game-lost', elo: loser.elo, wins: loser.wins, losses: loser.losses }));
  
            console.log("things", error, stdout, stderr);
            console.log("Deleting room2!")
            rooms.delete(roomId);
          } else {
           player.ws.send(JSON.stringify({ status: 'code-incorrect', output: output }));
          }
        });
      }, 2000);
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

        console.log("Deleting room3!")
        rooms.delete(roomId);
      }
    });
  });
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Incorrect username' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '50d' });

    res.cookie('token', token, {secure: false, maxAge: 999999, httpOnly: false});
    return res.json({ token: token, username: user.username, elo: user.elo, wins: user.wins, losses: user.losses });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username: username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '50d' });
    return res.json({ token: token, username: user.username, elo: user.elo, wins: user.wins, losses: user.losses });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});