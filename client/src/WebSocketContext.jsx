// src/WebSocketContext.jsx
import React, { createContext, useRef, useEffect, useState } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]); 

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onmessage = (event) => {
      let rawData;
      if (typeof event.data === 'string') {
        rawData = event.data;
      } else {
        rawData = event.data.text();
      }

      console.log('Message from server:', rawData);
      setMessages((prev) => [...prev, rawData]);

      try {
        const msg = JSON.parse(rawData);
        console.log("Handle Message: ", msg);

        if (msg.status === 'room-created' && msg.roomId) {
          setRoomId(msg.roomId);
          // TODO: Set navigation here
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, roomId, messages }}>
      {children}
    </WebSocketContext.Provider>
  );
};
