// src/useWebSocket.js
import { useRef, useEffect } from 'react';

// Adjust these URLs as needed
const ENVIRONMENT = 'development';
const DEV_WEBSOCKET_URL = 'ws://localhost:5000';
const PROD_WEBSOCKET_URL = 'wss://leet-battle.fly.dev';
const WEBSOCKET_URL = ENVIRONMENT === 'development' ? DEV_WEBSOCKET_URL : PROD_WEBSOCKET_URL;

function getProfileFromStorage() {
  try {
    const stored = localStorage.getItem('profile');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function notify(title, message) {
  if (!('Notification' in window)) {
    console.log('Browser does not support Notifications');
    return;
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    });
  }
}

export default function useWebSocket() {
  const socketRef = useRef(null);
  const keepAliveRef = useRef(null);

  // You can store session-related data in refs or global state
  const roomIDRef = useRef(null);
  const urlRef = useRef(null);
  const screenRef = useRef(null);
  const shuffleStatusRef = useRef(null);

  useEffect(() => {
    // Establish connection on mount
    connect();

    // Cleanup
    return () => {
      disconnect();
    };
    // This is a quick fix hack. Do not touch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function connect(initialMsg) {
    socketRef.current = new WebSocket(WEBSOCKET_URL);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      keepAlive();
      // Send initial message if needed
      if (initialMsg) {
        socketRef.current.send(JSON.stringify(initialMsg));
      }
    };

    socketRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data) || {};
      console.log("response", response);

      // Handle various server messages:
      if (response.status === 'game-start') {
        notify('Leet Battle', 'Match found!');
        if (response.roomID) {
          roomIDRef.current = response.roomID;
        }
        urlRef.current = response.url;
        window.open(response.url, '_blank');
        screenRef.current = 'room';
      }

      if (response.status === 'return-code') {
        roomIDRef.current = response.roomID;
        if (response.displayCode) {
          console.log('Received return-code:', response.roomID);
        }
      }

      if (response.status === 'game-won') {
        if (response.forfeit) {
          notify('Leet Battle', 'The opponent forfeited!');
        } else {
          window.open(`/game-end-page?status=win&roomID=${roomIDRef.current}`, '_blank');
        }
        disconnect();
      }

      if (response.status === 'game-lost') {
        if (response.forfeit) {
          console.log('Game lost by forfeit. Update stats:', response.elo, response.wins, response.losses);
        } else {
          window.open(`/game-end-page?status=lose&roomID=${roomIDRef.current}`, '_blank');
        }
        disconnect();
      }

      if (response.status === 'room-expired') {
        roomIDRef.current = null;
        urlRef.current = null;
        shuffleStatusRef.current = null;
        screenRef.current = 'room-expired';
        disconnect();
      }

      if (response.status === 'request-shuffle') {
        shuffleStatusRef.current = 'accept-shuffle';
        notify('Leet Battle', 'Opponent requested a problem shuffle!');
        // Possibly trigger some local UI
      }

      if (response.status === 'accept-shuffle') {
        shuffleStatusRef.current = null;
        urlRef.current = response.url;
        window.open(response.url, '_blank');
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      socketRef.current = null;
      roomIDRef.current = null;
      urlRef.current = null;
      screenRef.current = null;
      shuffleStatusRef.current = null;
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  function disconnect() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    roomIDRef.current = null;
    urlRef.current = null;
    screenRef.current = null;
    shuffleStatusRef.current = null;
  }


  function keepAlive() {
    keepAliveRef.current = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({ status: 'keepalive' }));
      }
    }, 20 * 1000);
  }

  function sendMessage(data) {
    const profile = getProfileFromStorage();
    console.log('Profile', profile);
    const profileDetails = {
      email: profile?.email,
      elo: profile?.elo,
      wins: profile?.wins,
      losses: profile?.losses
    };

    if (!socketRef.current) {
      connect({ ...data, ...profileDetails });
      console.log("No websocke");
    } else {
        console.log("Sending: ", { ...data, ...profileDetails });
      socketRef.current.send(JSON.stringify({ ...data, ...profileDetails }));
    }
  }

  // Return methods that your components might need
  return {
    sendMessage,
    connect,
    disconnect
  };
}
