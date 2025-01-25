// src/Home.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';

function Home() {
  const { sendMessage, roomId, messages } = useContext(WebSocketContext);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
        const errorData = await response.json();
        throw new Error(`Register failed: ${errorData.message || response.status}`);
      }
  
      const data = await response.json(); 
      console.log('Register successful:', data); 
      logMessage('Registration successful!');
    } catch (error) {
      console.error('Register failed:', error.message); 
      logMessage(`Register failed: ${error.message}`);
    }
  };    

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Login failed: ${errorData.message || response.status}`);
      }
  
      const data = await response.json(); 
      setUsername(data.username);
      console.log('Login successful:', data); 
      logMessage(`Logged in as ${data.username}`);
    } catch (error) {
      console.error('Login failed:', error.message); 
      logMessage(`Login failed: ${error.message}`);
    }
  };
  
  return (
    <div>
      <h1>{username ? `Welcome, ${username}!` : 'Please log in or register'}</h1>
      
      {/* Registration Form */}
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

      {/* Login Form */}
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
