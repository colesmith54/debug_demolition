// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';
import Box from '@mui/material/Box';
import { Container, Toolbar, Typography } from '@mui/material';

function Home() {
  const { sendMessage, roomId, setRoomId, messages } = useContext(WebSocketContext);

  const [username, setUsername] = useState('');
  const [elo, setElo] = useState('1000');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [code] = useState('');       // Not currently used
  const [gameResult] = useState(''); // Not currently used
  const [inputMessage] = useState(''); // Not currently used

  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      handleLogMessage(`Room Created: ${roomId}`);
      // navigate(`/room/${roomId}`); // If you want to auto-navigate on room creation
    }
  }, [roomId, navigate]);

  const handleLogMessage = (msg) => {
    // console.log(msg);
  };

  const handleSendTestMessage = (msg) => {
    const message = { status: 'test-message', content: msg };
    handleLogMessage('Client -> WS: ' + JSON.stringify(message));
    sendMessage(message);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'create-room',
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses),
    };
    handleLogMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'join-room',
      roomId: roomIdInput,
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses),
    };
    handleLogMessage('Client -> WS: ' + JSON.stringify(payload));
    setRoomId(roomIdInput);
    sendMessage(payload);
  };

  return (
    <div>
      <h1>WebSocket & Routes Test</h1>
      <button onClick={() => handleSendTestMessage('Test')}>Send Test Message</button>
      <hr />

      <h3>Room & Game Actions</h3>
      <form onSubmit={handleCreateRoom}>
        <h4>Create Room</h4>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
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

      <form onSubmit={handleJoinRoom}>
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
          } catch {
            // Keep original if not JSON
          }
          return <li key={i}>{displayMessage}</li>;
        })}
      </ul>
    </div>
  );
}

export default Home;
