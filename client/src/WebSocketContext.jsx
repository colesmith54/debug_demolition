import React, { createContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [problemHtml, setProblemHtml] = useState(null);
  const [initialCode, setInitialCode] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null); 

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
          setProblemHtml(msg.problem_description);
          setInitialCode(msg.initialCode);
          setHasNavigated(true);
          navigate('/room');
        } else if (msg.status === 'game-won') {
          navigate('/');
        } else if (msg.status === 'game-lost') {
          navigate('/');
        } else if(msg.status === 'game-tie') {
          navigate('/');
        } else if(msg.status === 'code-incorrect') {
          console.log("Code is incorrect. Please try again.");
          setAlert("Code is incorrect. Please try again.");
        } else {
          console.error('Invalid message:', msg.status);
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
    <WebSocketContext.Provider value={{ sendMessage, roomId, setRoomId, messages, problemHtml, initialCode, setHasNavigated }}>
      {children}
    </WebSocketContext.Provider>
  );
};
