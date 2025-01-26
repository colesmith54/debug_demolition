import React, { createContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const username = useRef(null);

  const setUsername = (name) => {
    username.current = name;
  };

  const getUsername = () => {
    return username.current;
  }

  return (
    <AuthContext.Provider value={{ setUsername, getUsername }}>
      {children}
    </AuthContext.Provider>
  );
};
