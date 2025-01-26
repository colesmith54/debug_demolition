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
  // const [code] = useState('');       // Not currently used
  // const [gameResult] = useState(''); // Not currently used
  // const [inputMessage] = useState(''); // Not currently used

  const createRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'create-room',
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses),
    };
    sendMessage(payload);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'join-room',
      roomId: roomIdInput,
      // username: username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses),
    };
    setRoomId(roomIdInput);
    sendMessage(payload);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h4>Statistics</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
          <div>
            <p style={{ margin: 0 }}>ELO</p>
            <p style={{ fontWeight: 'bold', margin: 0 }}>{elo}</p>
          </div>
          <div>
            <p style={{ margin: 0 }}>Wins</p>
            <p style={{ fontWeight: 'bold', margin: 0 }}>{wins}</p>
          </div>
          <div>
            <p style={{ margin: 0 }}>Losses</p>
            <p style={{ fontWeight: 'bold', margin: 0 }}>{losses}</p>
          </div>
        </div>
      </div>

      <hr />

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
        <form
            onSubmit={createRoom}
            style={{ width: '150px', alignItems: 'center',  display: 'flex', flexDirection: 'column', maxWidth: '200px' }}
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


          <form
            onSubmit={joinRoom}
            style={{ width: '150px', alignItems: 'center', display: 'flex', flexDirection: 'column', maxWidth: '200px' }}
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

          <div style={{ width: '150px', alignItems: 'center', marginTop: '20px', textAlign: 'center' }}>
          {roomId ? (
            <p>You are in room {roomId} with 1/2 capacity</p>
          ) : (
            <p>You are not in a room</p>
          )}
        </div>
      </div>

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
            displayMessage = msg;
          }
          return <li key={i}>{displayMessage}</li>;
        })}
      </ul>
    </div>
  );
}

export default Home;
