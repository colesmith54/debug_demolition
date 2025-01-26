// WebSocketContext.js
import React, { createContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWebSocketInstance } from './WebSocketSingleton'; // Import the singleton getter

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [problemHtml, setProblemHtml] = useState(null);
  const [initialCode, setInitialCode] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [elo, setElo] = useState(1000);
  const [eloOther, setEloOther] = useState(1000);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const opponent = useRef(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to store the WebSocket instance
  const socketRef = useRef(null);
  const judgeResult = useRef(null);

  useEffect(() => {
    // Get the singleton WebSocket instance
    const socket = getWebSocketInstance();
    socketRef.current = socket;

    // Define the onmessage handler
    const handleMessage = (event) => {
      let rawData;
      if (typeof event.data === 'string') {
        rawData = event.data;
      } else {
        // If event.data is a Blob or other type
        rawData = event.data.text();
      }

      console.log('Message from server:', rawData);
      setMessages((prev) => [...prev, rawData]);

      try {
        const msg = JSON.parse(rawData);
        console.log('Handle Message:', msg);

        if (msg.status === 'room-updated') {
          console.log('Member count:', msg.memberCount);
          setMemberCount(msg.memberCount);
        }
        if (msg.status === 'room-created' && msg.roomId) {
          setMemberCount(1);
          setRoomId(msg.roomId);
        } else if (msg.status === 'leave-room') {
          setRoomId(null);
          setMemberCount(0);
          setIsLoading(false);
          console.log('Room left');
        } else if (msg.status === 'game-start') {
          setHasNavigated(true);
          setProblemHtml(msg.problem_description);
          setInitialCode(msg.initialCode);
          setEloOther(msg.eloOther);
          opponent.current = msg.opponent;
          navigate('/room');
        } else if (msg.status === 'game-won') {
          setAlert('You won the game. Congratulations!');
          setWins((prev) => prev + 1);
          setElo(msg.elo);
          setRoomId(null);
          judgeResult.current = null;
          navigate('/');
        } else if (msg.status === 'game-lost') {
          setAlert('You lost the game. Better luck next time!');
          setLosses((prev) => prev + 1);
          setElo(msg.elo);
          setRoomId(null);
          judgeResult.current = null;
          navigate('/');
        } else if (msg.status === 'game-tie') {
          setAlert('The game ended in a tie. Better luck next time!');
          setRoomId(null);
          judgeResult.current = null;
          navigate('/');
        } else if (msg.status === 'code-incorrect') {
          console.log('Code is incorrect. Please try again.');
          setAlert('Code is incorrect. Please try again.');
          console.log('output', msg.output)
          judgeResult.current = msg.output
        } else {
          console.error('Invalid message:', msg.status);
        }
      } catch (err) {
        console.error('Invalid JSON:', err);
      }
      setIsLoading(false);
    };

    // Attach the message handler
    socket.addEventListener('message', handleMessage);

    // Cleanup function
    return () => {
      socket.removeEventListener('message', handleMessage);
      // Do NOT close the socket here to keep it alive across navigations
      console.log('WebSocketProvider unmounted, but socket persists');
    };
  }, [navigate]);

  const sendMessage = (message) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        roomId,
        setRoomId,
        messages,
        memberCount,
        problemHtml,
        initialCode,
        hasNavigated,
        setHasNavigated,
        opponent,
        alert,
        judgeResult,
        isLoading,
        setIsLoading,
        elo,
        eloOther,
        wins,
        losses,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};