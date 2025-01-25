import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './WebSocketContext';
import Home from './Home';
import Room from './Room';
import RouteGuard from './RouteGuard';

function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/room"
            element={
              <RouteGuard>
                <Room />
              </RouteGuard>
            }
          />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
