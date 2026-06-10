import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/firebase';

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    const backendUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';
    const socketInstance = io(backendUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });

    // Intercept connect calls to dynamically attach authentication token in a type-safe way
    const originalConnect = socketInstance.connect.bind(socketInstance);
    socketInstance.connect = () => {
      const user = auth.currentUser;
      if (user) {
        user.getIdToken()
          .then((token) => {
            socketInstance.auth = { token: `Bearer ${token}` };
            originalConnect();
          })
          .catch((err) => {
            console.error("Socket authentication token acquisition failed:", err);
            originalConnect();
          });
      } else {
        originalConnect();
      }
      return socketInstance;
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket as any}>
      {children}
    </SocketContext.Provider>
  );
};
