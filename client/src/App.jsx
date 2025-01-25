import React, { useEffect } from 'react';
import useWebSocket from './useWebSocket';

function App() {
  const {
    roomID,
    url,
    screen,
    shuffleStatus,
    connect,
    disconnect,
    sendMessage,
  } = useWebSocket();

  useEffect(() => {
    // Request Notification permission once (if not granted)
    Notification.requestPermission();
  }, []);

  const handleCreateRoom = () => {
    sendMessage({ status: 'create-room', difficulty: ['Medium'] });
  };

  const handleJoinRoom = () => {
    sendMessage({ status: 'join-room', roomID: 'ABC123' });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Leet Battle React</h1>
      <p>WebSocket URL: {url}</p>
      <p>Current Screen: {screen}</p>
      <p>Shuffle Status: {shuffleStatus}</p>
      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={handleJoinRoom}>Join Room</button>
      <button onClick={() => sendMessage({ status: 'play-online', difficulty: ['Easy', 'Medium'] })}>
        Play Online
      </button>
      <button onClick={disconnect}>End Session</button>
      {roomID && <p>Room ID: {roomID}</p>}
    </div>
  );
}

export default App;


// import { useState } from 'react'

// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
