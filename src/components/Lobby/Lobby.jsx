import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import './Lobby.css';

function Lobby() {
    const {
        inLobby,
        roomCode,
        players,
        isHost,
        lobbyError,
        createRoom,
        joinRoom,
        startGame
    } = useGame();

    const [view, setView] = useState('menu'); // menu, create, join
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (name.trim()) {
            createRoom(name.trim());
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim() && code.trim()) {
            joinRoom(code.trim(), name.trim());
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
    };

    // Waiting Room
    if (inLobby) {
        return (
            <div className="lobby-container">
                <div className="waiting-room glass-card animate-scale-in">
                    <div className="waiting-header">
                        <h2>🎮 Game Lobby</h2>
                        <div className="room-code-display">
                            <span className="code-label">Invitation Code</span>
                            <div className="code-box" onClick={copyCode} title="Click to copy">
                                <span className="code">{roomCode}</span>
                                <span className="copy-icon">📋</span>
                            </div>
                            <span className="code-hint">Share this code with friends!</span>
                        </div>
                    </div>

                    <div className="players-section">
                        <h3>Players ({players.length})</h3>
                        <div className="players-list">
                            {players.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`player-item ${player.isHost ? 'host' : ''}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <span className="player-avatar">
                                        {player.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="player-name">{player.name}</span>
                                    {player.isHost && <span className="host-badge">👑 Host</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="waiting-actions">
                        {isHost ? (
                            <>
                                <button
                                    className="btn btn-success start-btn"
                                    onClick={startGame}
                                    disabled={players.length < 2}
                                >
                                    {players.length < 2
                                        ? 'Waiting for players...'
                                        : `Start Game (${players.length} players)`
                                    }
                                </button>
                                {players.length < 2 && (
                                    <p className="waiting-hint">Need at least 2 players to start</p>
                                )}
                            </>
                        ) : (
                            <div className="waiting-message">
                                <div className="waiting-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <p>Waiting for host to start the game...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main Menu
    if (view === 'menu') {
        return (
            <div className="lobby-container">
                <div className="lobby-content">
                    <div className="logo-section animate-slide-up">
                        <div className="logo">
                            <span className="logo-text">UNO</span>
                            <span className="logo-subtitle">NO MERCY</span>
                        </div>
                        <p className="tagline">The Ultimate Card Game Experience</p>
                    </div>

                    <div className="menu-buttons animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <button
                            className="btn btn-primary menu-btn"
                            onClick={() => setView('create')}
                        >
                            <span className="btn-icon">🎮</span>
                            Create Game
                        </button>
                        <button
                            className="btn btn-secondary menu-btn"
                            onClick={() => setView('join')}
                        >
                            <span className="btn-icon">🔗</span>
                            Join Game
                        </button>
                    </div>

                    <div className="rules-preview animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <h3>⚡ No-Mercy Rules</h3>
                        <ul>
                            <li>🔥 Stack +2 and +4 cards</li>
                            <li>⏱️ 10 seconds per turn</li>
                            <li>📥 Draw until you can play</li>
                            <li>💀 30+ cards = Game Over</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Create Game Form
    if (view === 'create') {
        return (
            <div className="lobby-container">
                <div className="form-card glass-card animate-scale-in">
                    <button className="back-btn" onClick={() => setView('menu')}>
                        ← Back
                    </button>
                    <h2>Create New Game</h2>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label htmlFor="create-name">Your Name</label>
                            <input
                                id="create-name"
                                type="text"
                                className="input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!name.trim()}
                        >
                            Create Game
                        </button>
                    </form>
                    {lobbyError && <p className="error-message">{lobbyError}</p>}
                </div>
            </div>
        );
    }

    // Join Game Form
    if (view === 'join') {
        return (
            <div className="lobby-container">
                <div className="form-card glass-card animate-scale-in">
                    <button className="back-btn" onClick={() => setView('menu')}>
                        ← Back
                    </button>
                    <h2>Join Game</h2>
                    <form onSubmit={handleJoin}>
                        <div className="form-group">
                            <label htmlFor="join-name">Your Name</label>
                            <input
                                id="join-name"
                                type="text"
                                className="input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="join-code">Invitation Code</label>
                            <input
                                id="join-code"
                                type="text"
                                className="input code-input"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!name.trim() || code.length !== 6}
                        >
                            Join Game
                        </button>
                    </form>
                    {lobbyError && <p className="error-message">{lobbyError}</p>}
                </div>
            </div>
        );
    }

    return null;
}

export default Lobby;
