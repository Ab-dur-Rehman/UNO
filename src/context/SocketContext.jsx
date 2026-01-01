import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        // Connect to Socket.io server - use env variable in production
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const newSocket = io(backendUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
            setConnectionError(null);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionError('Failed to connect to server. Please make sure the server is running.');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const emit = useCallback((event, data) => {
        if (socket) {
            socket.emit(event, data);
        }
    }, [socket]);

    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => { };
    }, [socket]);

    const off = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    const value = {
        socket,
        isConnected,
        connectionError,
        emit,
        on,
        off
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}
