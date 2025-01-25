// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';

function Home() {
  const { sendMessage, addMessageListener, removeMessageListener } = useContext(WebSocketContext);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [elo, setElo] = useState('1000');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [code, setCode] = useState('');
  const [gameResult, setGameResult] = useState('win');

  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = async (event) => {
      let rawData;
      if (typeof event.data === 'string') {
        rawData = event.data;
      } else {
        rawData = await event.data.text();
      }

      console.log('Message from server:', rawData);
      logMessage(rawData);

      try {
        const msg = JSON.parse(rawData);

        if (msg.status === 'room-created' && msg.roomId) {
          setRoomId(msg.roomId);
          navigate(`/room/${msg.roomId}`);
        }

        if (msg.status === 'game-start' && msg.roomId) {
          setRoomId(msg.roomId);
          navigate(`/room/${msg.roomId}`);
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
    };

    // Add WebSocket message listener
    addMessageListener(handleMessage);

    // Cleanup on unmount
    return () => {
      removeMessageListener(handleMessage);
    };
  }, [addMessageListener, removeMessageListener, navigate]);

  const logMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
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
      losses: Number(losses)
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    sendMessage(payload);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const payload = {
      status: 'join-room',
      roomId,
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
      <h1>WebSocket & Routes Test</h1>
      <button onClick={() => sendTestMessage('Test')}>Send Test Message</button>
      <hr />
      <h3>Room & Game Actions</h3>
      <form onSubmit={createRoom}>
        <h4>Create Room</h4>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <button type="submit">Create</button>
      </form>
      <form onSubmit={joinRoom}>
        <h4>Join Room</h4>
        <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
        <button type="submit">Join</button>
      </form>
      <hr />
      <h2>Log</h2>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
