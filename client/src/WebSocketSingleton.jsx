// webSocketSingleton.js
let socketInstance = null;

export const getWebSocketInstance = () => {
  if (!socketInstance || socketInstance.readyState === WebSocket.CLOSED) {
    socketInstance = new WebSocket('ws://localhost:5000');

    socketInstance.onopen = () => {
      console.log('Singleton WebSocket connected');
    };

    socketInstance.onclose = () => {
      console.log('Singleton WebSocket disconnected');
      socketInstance = null; 
    };

    socketInstance.onerror = (error) => {
      console.error('Singleton WebSocket error:', error);
    };
  }
  return socketInstance;
};
