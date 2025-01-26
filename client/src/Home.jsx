// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';
import Box from '@mui/material/Box';
import {Container, Toolbar, Typography} from "@mui/material";
import {AuthContext} from "./AuthContext.jsx";

function Home() {
  const { sendMessage, roomId, setRoomId, messages, memberCount, alert } = useContext(WebSocketContext);
  const {username} = useContext(AuthContext);

  const [elo, setElo] = useState('1000');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const createRoom = (e) => {
    e.preventDefault();
    setIsLoading(true); 
    try {
      const payload = {
      status: 'create-room',
      username: username.current,
      elo: Number(elo),
        wins: Number(wins),
        losses: Number(losses)
      };
      sendMessage(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const payload = {
        status: 'join-room',
        roomId: roomIdInput,
        username: username.current,
        elo: Number(elo),
        wins: Number(wins),
        losses: Number(losses)
      };
      setRoomId(roomIdInput);
      sendMessage(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = () => {
    setRoomId('');
    sendMessage({ status: 'leave-room', roomId });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      {alert && (
          <p>{alert}</p>
      )}
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
              {roomId ? `Room ID: ${roomId}` : 'Create'}
            </button>
          </form>


          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!roomId) {
                joinRoom(e); 
              }
            }}
            style={{ width: '150px', alignItems: 'center', display: 'flex', flexDirection: 'column', maxWidth: '200px' }}
          >
            <h4>
              {!roomId ? 'Join Room' : (
                <span 
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    alert('Room ID copied to clipboard!'); // Replace with better feedback if needed
                  }}
                >
                  Room ID: {roomId}
                </span>
              )}
            </h4>
            {!roomId && (
              <input
                type="text"
                placeholder="Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                required
                style={{ marginBottom: '8px' }}
              />
            )}
            <button
              type="submit"
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              {!roomId ? 'Join' : 'Leave'}
            </button>
          </form>

          <div style={{ width: '150px', alignItems: 'center', marginTop: '20px', textAlign: 'center' }}>
            {roomId ? (
              <p>You are in room {roomId} with {memberCount}/2 capacity</p>
            ) : (
              <p>You are not in a room</p>
            )}
          </div>
      </div>
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div className="spinner" />
        </div>
      )}

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
