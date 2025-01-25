// src/Room.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext.jsx';

function Room() {
  const { roomId } = useParams();
  const socket = useContext(WebSocketContext);
  const [roomMessages, setRoomMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = async (event) => {
      let rawData;
      if (typeof event.data === 'string') {
        rawData = event.data;
      } else {
        rawData = await event.data.text();
      }

      console.log('Room message from server:', rawData);
      try {
        const msg = JSON.parse(rawData);
        if (msg.roomId === roomId) { // Ensure the message is relevant to this room
          setRoomMessages((prev) => [...prev, msg]);
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
    };

    // Cleanup listener on unmount
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, roomId]);

  return (
    <div>
      <h1>Room Page</h1>
      <p>Welcome to Room ID: {roomId}</p>
      <h2>Room Messages:</h2>
      <ul>
        {roomMessages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
      {/* Add more room-specific UI components here */}
    </div>
  );
}

export default Room;
