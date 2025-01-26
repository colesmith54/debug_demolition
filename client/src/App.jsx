import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebSocketProvider } from './WebSocketContext';
import Home from './Home';
import Room from './Room';
import RouteGuard from './RouteGuard';
import Layout from "../templates/Layout.jsx";
import Box from "@mui/material/Box";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import { AuthProvider } from "./AuthContext.jsx";


function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Box></Box>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/room"
                element={
                  <RouteGuard>
                    <Room />
                  </RouteGuard>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
