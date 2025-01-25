import React, { createContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [problemHtml, setProblemHtml] = useState(null);
  const [initialCode, setInitialCode] = useState(null);
  const navigate = useNavigate(); // Hook to navigate

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
        } else if (msg.status === 'game-start') {
          setProblemHtml(msg.problemHtml);
          setInitialCode(msg.initialCode);

          navigate('/room');
        } else if (msg.status === 'game-won') {
          // navigate to home, display some win message with new elo
          navigate('/');
        } else if (msg.status === 'game-lost') {
          // navigate to home, display some lose message with new elo
          navigate('/');
        } else if (msg.status === 'room-invalid') {
          // user went to /room without creating/joining a room
          navigate('/');
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [navigate]);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, roomId, messages, problemHtml, initialCode }}>
      {children}
    </WebSocketContext.Provider>
  );
};
