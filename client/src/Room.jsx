import React from 'react';
import { useParams } from 'react-router-dom';

function Room() {
  const { roomId } = useParams();

  return (
    <div>
      <h1>Room Page</h1>
      <p>Welcome to Room ID: {roomId}</p>
      
    </div>
  );
}

export default Room;
