import React from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { GameProvider, useGame } from './context/GameContext';
import Lobby from './components/Lobby/Lobby';
import Game from './components/Game/Game';
import GameOver from './components/Game/GameOver';
import './App.css';

function AppContent() {
    const { isConnected, connectionError } = useSocket();
    const { inLobby, isPlaying, gameOver } = useGame();

    if (connectionError) {
        return (
            <div className="app-container">
                <div className="connection-error">
                    <div className="error-icon">⚠️</div>
                    <h2>Connection Error</h2>
                    <p>{connectionError}</p>
                    <p className="error-hint">
                        Make sure the server is running:<br />
                        <code>cd server && npm install && npm start</code>
                    </p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="app-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Connecting to server...</p>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="app-container">
                <GameOver />
            </div>
        );
    }

    if (isPlaying) {
        return (
            <div className="app-container">
                <Game />
            </div>
        );
    }

    return (
        <div className="app-container">
            <Lobby />
        </div>
    );
}

function App() {
    return (
        <SocketProvider>
            <GameProvider>
                <AppContent />
            </GameProvider>
        </SocketProvider>
    );
}

export default App;
