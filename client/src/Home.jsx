import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [elo, setElo] = useState('1000');
  const [wins, setWins] = useState('0');
  const [losses, setLosses] = useState('0');
  const [code, setCode] = useState('');
  const [gameResult, setGameResult] = useState('win');
  
  const navigate = useNavigate(); // Hook to navigate programmatically

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      logMessage('Connected to WS server');
    };

    
socketRef.current.onmessage = (event) => {
    console.log('Message from server:', event.data);
    logMessage(event.data);
    
    const msg = JSON.parse(event.data);
    
    if (msg.status === 'room-created' && msg.roomId) {
      setRoomId(msg.roomId); 
      navigate(`/room/${msg.roomId}`); 
    }
  
    if (msg.status === 'game-start' && msg.roomId) {
      setRoomId(msg.roomId); 
      navigate(`/room/${msg.roomId}`);
    }
  };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      logMessage('WS disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      logMessage('WS error: ' + error);
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [navigate, roomId]);

  // Helper to store messages in state
  const logMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Test route to check server
  const checkServer = async () => {
    try {
      const res = await fetch('http://localhost:5000/test-cors');
      const data = await res.json();
      logMessage('GET /test-cors => ' + JSON.stringify(data));
    } catch (err) {
      logMessage('GET /test-cors error: ' + err);
    }
  };

  // Basic “send message” for test
  const sendTestMessage = (m) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ status: 'test-message', content: m });
      logMessage('Client -> WS: ' + message);
      socketRef.current.send(message);
    } else {
      logMessage('WS not connected');
    }
  };

  // Create room
  const createRoom = (e) => {
    e.preventDefault();
    if (!socketRef.current) return;
    const payload = {
      status: 'create-room',
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses)
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    socketRef.current.send(JSON.stringify(payload));
  };

  // Join room
  const joinRoom = (e) => {
    e.preventDefault();
    if (!socketRef.current) return;
    const payload = {
      status: 'join-room',
      roomId,
      username,
      elo: Number(elo),
      wins: Number(wins),
      losses: Number(losses)
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    socketRef.current.send(JSON.stringify(payload));
  };

  // End game
  const endGame = (e) => {
    e.preventDefault();
    if (!socketRef.current) return;
    const payload = {
      status: 'game-end',
      roomId,
      result: gameResult
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    socketRef.current.send(JSON.stringify(payload));
  };

  // Code submission
  const submitCode = (e) => {
    e.preventDefault();
    if (!socketRef.current) return;
    const payload = {
      status: 'code-submission',
      roomId,
      code
    };
    logMessage('Client -> WS: ' + JSON.stringify(payload));
    socketRef.current.send(JSON.stringify(payload));
  };

  return (
    <div>
      <h1>WebSocket & Routes Test</h1>
      <button onClick={checkServer}>Check Server (GET /test-cors)</button>
      <hr />

      <form onSubmit={(e) => { e.preventDefault(); sendTestMessage(inputMessage); }}>
        <label>Send Test Message: </label>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type message"
        />
        <button type="submit">Send</button>
      </form>

      <hr />
      <h3>Room & Game Actions</h3>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <form onSubmit={createRoom}>
          <h4>Create Room</h4>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input placeholder="ELO" type="number" value={elo} onChange={(e) => setElo(e.target.value)} required />
          <input placeholder="Wins" type="number" value={wins} onChange={(e) => setWins(e.target.value)} required />
          <input placeholder="Losses" type="number" value={losses} onChange={(e) => setLosses(e.target.value)} required />
          <button type="submit">Create</button>
        </form>

        <form onSubmit={joinRoom}>
          <h4>Join Room</h4>
          <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <button type="submit">Join</button>
        </form>

        <form onSubmit={endGame}>
          <h4>End Game</h4>
          <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
          <select value={gameResult} onChange={(e) => setGameResult(e.target.value)}>
            <option value="win">Win</option>
            <option value="lose">Lose</option>
          </select>
          <button type="submit">Send</button>
        </form>

        <form onSubmit={submitCode}>
          <h4>Code Submission</h4>
          <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
          <textarea placeholder="Your code here" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button type="submit">Submit</button>
        </form>
      </div>

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