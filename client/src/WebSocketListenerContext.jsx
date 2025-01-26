import React, { createContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {WebSocketContext} from "./WebSocketContext.jsx";

export const WebSocketListenerContext = createContext(null);

export default function WebSocketListenerProvider ({children}) {

}
