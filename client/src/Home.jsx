// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';
import Box from '@mui/material/Box';
import { Container, Toolbar, Typography } from "@mui/material";

function Home() {
  const { sendMessage, roomId, setRoomId, messages } = useContext(WebSocketContext);
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
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses),
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
      losses: Number(losses),
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    setRoomId(roomIdInput);
    sendMessage(payload);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>WebSocket & Routes Test</h1>
      <button
        style={{
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
        onClick={() => sendTestMessage('Test')}
      >
        Send Test Message
      </button>

      <hr />

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
        {/* CREATE ROOM FORM (username is from user state, no ELO/Wins/Losses fields) */}
        <form
          onSubmit={createRoom}
          style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}
        >
          <h4>Create Room</h4>
          <button
            type="submit"
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Create
          </button>
        </form>

        {/* JOIN ROOM FORM */}
        <form
          onSubmit={joinRoom}
          style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}
        >
          <h4>Join Room</h4>
          <input
            type="text"
            placeholder="Room ID"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            required
            style={{ marginBottom: '8px' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Join
          </button>
        </form>
      </div>

      {/* ROOM STATUS */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {roomId ? (
          <p>You are in room {roomId} with 1/2 capacity</p>
        ) : (
          <p>You are not in a room</p>
        )}
      </div>

      {/* STATISTICS */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h4>Statistics</h4>
        <p>ELO: {elo}</p>
        <p>Wins: {wins}</p>
        <p>Losses: {losses}</p>
      </div>

      <hr />

      <h2>Log</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
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
            // If not JSON, keep the original message
          }
          return <li key={i} style={{ marginBottom: '4px' }}>{displayMessage}</li>;
        })}
      </ul>
    </div>
  );
}

export default Home;
