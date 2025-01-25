import React, { useEffect, useRef, useState } from 'react';

function App() {
  const socketRef = useRef(null); 
  const [messages, setMessages] = useState([]); 
  const [inputMessage, setInputMessage] = useState(''); 

  // Establish WebSocket connection
  useEffect(() => {
<<<<<<< Updated upstream
    socketRef.current = new WebSocket('ws://localhost:5000'); // Connect to WebSocket server
=======
    socketRef.current = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server
>>>>>>> Stashed changes

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      console.log('Message from server:', event.data); // Log received message
      setMessages((prevMessages) => [...prevMessages, event.data]); // Add to state
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

  // Function to send a message
  const sendMessage = (m) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ status: 'test-message', content: m });
      console.log('Sending message:', message);
      socketRef.current.send(message); // Send message to server
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <div>
      <h1>WebSocket Test</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault(); 
          sendMessage(inputMessage);
        }}
      >
        <input
          type="text"
          placeholder="Type your message"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)} 
        />
        <button type="submit">Send</button>
      </form>

      <h2>Received Messages:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
