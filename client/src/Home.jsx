// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';

function Home() {
  const { sendMessage, addMessageListener, removeMessageListener } = useContext(WebSocketContext);
  const [messages, setMessages] = useState([]);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [username, setUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [inputMessage, setInputMessage] = useState('');

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

  const register = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/register', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json(); 
      console.log('Register successful:', data); 
    } catch (error) {
      console.error('Register failed:', error.message); 
    }
  };    

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', { // TODO: Change localhost to URL
        method: 'POST', // HTTP method
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json(); 
      console.log('Login successful:', data); 
    } catch (error) {
      console.error('Login failed:', error.message); 
    }
  };
  
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register(registerUsername, registerPassword);
        }}
      >
        <h4>Register</h4>
        <input
          type="text"
          placeholder="Username"
          value={registerUsername}
          onChange={(e) => setRegisterUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(loginUsername, loginPassword);
        }}
      >
        <h4>Login</h4>
        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <h1>WebSocket & Routes Test</h1>
      <button onClick={() => sendMessage({ content: inputMessage })}>Send Test Message</button>
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
