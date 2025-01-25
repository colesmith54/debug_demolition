import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { WebSocketContext } from './WebSocketContext';

const RouteGuard = ({ children }) => {
  const { hasNavigated } = useContext(WebSocketContext);

  // if (!hasNavigated) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default RouteGuard;
