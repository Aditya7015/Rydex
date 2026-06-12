import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    // Initialize socket connection
    socket.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      auth: { token }
    });

    socket.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socket.current.emit('register', user.id);
    });

    socket.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]);

  const emit = (event, data) => {
    if (socket.current && isConnected) {
      socket.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket.current) {
      socket.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket.current) {
      socket.current.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socket.current, isConnected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};