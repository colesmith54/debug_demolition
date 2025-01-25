// src/WebSocketContext.jsx
import React, { createContext, useRef, useEffect } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
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

    // Cleanup on unmount
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  const addMessageListener = (listener) => {
    if (socketRef.current) {
      socketRef.current.addEventListener('message', listener);
    }
  };

  const removeMessageListener = (listener) => {
    if (socketRef.current) {
      socketRef.current.removeEventListener('message', listener);
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, addMessageListener, removeMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};
