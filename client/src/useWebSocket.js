// src/useWebSocket.js
import { useRef, useEffect } from 'react';

const ENVIRONMENT = 'development';
const DEV_WEBSOCKET_URL = 'ws://localhost:3000';
const PROD_WEBSOCKET_URL = 'wss://leet-battle.fly.dev';
const WEBSOCKET_URL = ENVIRONMENT === 'development' ? DEV_WEBSOCKET_URL : PROD_WEBSOCKET_URL;

export default function useWebSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = new WebSocket(WEBSOCKET_URL);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {};
}

