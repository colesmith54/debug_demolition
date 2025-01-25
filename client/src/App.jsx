import React, { useState, useEffect } from 'react';
import useWebSocket from './useWebSocket';

function App() {
  const { sendMessage, connect, disconnect } = useWebSocket();
  const [rooms, setRooms] = useState([]); // To store available rooms
  const [url, setUrl] = useState('');
  const [screen, setScreen] = useState('');
  const [shuffleStatus, setShuffleStatus] = useState('');
  const [roomID, setRoomID] = useState('');

  // Set test profile in localStorage only once
  useEffect(() => {
    localStorage.setItem(
      'profile',
      JSON.stringify({
        email: 'test@example.com',
        elo: 1200,
        wins: 10,
        losses: 5,
      })
    );
    console.log('localStorage:', localStorage.getItem('profile'));
  }, []);

  useEffect(() => {
    connect(); // Establish WebSocket connection on mount

    // Listen for WebSocket messages
    const handleServerMessage = (response) => {
      console.log("Received from server:", response);

      if (response.status === 'list-rooms') {
        console.log('Rooms', response.rooms);
        setRooms(response.rooms || []);
      }
      if (response.status === 'game-start') {
        setRoomID(response.roomID);
        setUrl(response.url);
        setScreen('room');
      }
      if (response.status === 'request-shuffle') {
        setShuffleStatus('accept-shuffle');
      }
    };

    // Attach WebSocket onmessage handler
    const socket = window.socketRef?.current;
    if (socket) {
      socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        handleServerMessage(response);
      };
    }

    // Cleanup
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const handleCreateRoom = () => {
    sendMessage({ status: 'create-room', difficulty: 'Medium' });
  };

  const handleJoinRoom = (roomID) => {
    sendMessage({ status: 'join-room', roomID });
    setRoomID(roomID); // Update room ID
  };

  const listRooms = () => {
    sendMessage({ status: 'list-rooms' });
  };

  return (
    <div>
      <h1>Leet Battle React</h1>
      <p>WebSocket URL: {url}</p>
      <p>Current Screen: {screen}</p>
      <p>Shuffle Status: {shuffleStatus}</p>
      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={listRooms}>List Rooms</button>
      <button onClick={() => sendMessage({ status: 'play-online', difficulty: ['Easy', 'Medium'] })}>
        Play Online
      </button>
      <button onClick={disconnect}>End Session</button>
      {roomID && <p>Room ID: {roomID}</p>}

      <h2>Available Rooms</h2>
      {rooms.length > 0 ? (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              {room.name} - <button onClick={() => handleJoinRoom(room.id)}>Join</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No rooms available. Click List Rooms to refresh.</p>
      )}
    </div>
  );
}

export default App;
