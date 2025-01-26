// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';
import Box from '@mui/material/Box';
import {Container, Toolbar, Typography} from "@mui/material";

function Home() {
  const { sendMessage, roomId, messages } = useContext(WebSocketContext);
  const [username, setUsername] = useState('');
  const [elo, setElo] = useState('1000');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [code, setCode] = useState('');
  const [gameResult, setGameResult] = useState('win');
  const [inputMessage, setInputMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      logMessage(`Room Created: ${roomId}`);
      // navigate(`/room/${roomId}`);
    }
  }, [roomId, navigate]);

  const logMessage = (msg) => {
    // console.log(msg);
  };

  const sendTestMessage = (m) => {
    const message = { status: 'test-message', content: m };
    logMessage('Client -> WS: ' + JSON.stringify(message));
    sendMessage(message);
  };

  const createRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'create-room',
      username: username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses)
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'join-room',
      roomId: roomIdInput,
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses)
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };

  const endGame = (e) => {
    e.preventDefault();
    const payload = {
      status: 'game-end',
      roomId,
      result: gameResult
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };

  const submitCode = (e) => {
    e.preventDefault();
    const payload = {
      status: 'code-submission',
      roomId,
      code
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };
  
  return (
    <div>
      {/*<Box>*/}
      {/*  <Typography variant="h6" gutterBottom>{username ? `Welcome, ${username}!` : 'Please log in or register'}</Typography>*/}
      {/*</Box>*/}

      {/* WebSocket Test */}
      <h1>WebSocket & Routes Test</h1>
      <button onClick={() => sendTestMessage('Test')}>Send Test Message</button>
      <hr />

      {/* Room & Game Actions */}
      <h3>Room & Game Actions</h3>
      <form onSubmit={createRoom}>
        <h4>Create Room</h4>
        <label>
          ELO:
          <input
            type="number"
            value={elo}
            onChange={(e) => setElo(e.target.value)}
            required
          />
        </label>
        <label>
          Wins:
          <input
            type="number"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            required
          />
        </label>
        <label>
          Losses:
          <input
            type="number"
            value={losses}
            onChange={(e) => setLosses(e.target.value)}
            required
          />
        </label>
        <button type="submit">Create</button>
      </form>

      <form onSubmit={joinRoom}>
        <h4>Join Room</h4>
        <input
          type="text"
          placeholder="Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
      
      <hr />

      {/* Log Messages */}
      <h2>Log</h2>
      <ul>
        {messages.map((msg, i) => {
          let displayMessage = msg;
          try {
            const parsed = JSON.parse(msg);
            if (parsed.status === 'room-created') {
              displayMessage = `Room Created: ID ${parsed.roomId}`;
            } else if (parsed.status === 'game-start') {
              displayMessage = `Game Started in Room: ID ${parsed.roomId}`;
            }
            // Add more conditions as needed
          } catch {
            // If not JSON, keep the original message
          }

          return <li key={i}>{displayMessage}</li>;
        })}
      </ul>
    </div>
  );
}

export default Home;
