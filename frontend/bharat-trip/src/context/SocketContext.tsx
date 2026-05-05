import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket>(null);

  useEffect(() => {
    // Replace with your backend URL
    const backendUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(backendUrl, {
      autoConnect: false,
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current as any}>
      {children}
    </SocketContext.Provider>
  );
};
