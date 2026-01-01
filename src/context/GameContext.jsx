import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext(null);

export function useGame() {
    return useContext(GameContext);
}

export function GameProvider({ children }) {
    const { emit, on, off, isConnected } = useSocket();

    // Lobby state
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [lobbyError, setLobbyError] = useState('');

    // Game state
    const [gameState, setGameState] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameError, setGameError] = useState('');
    const [canPlayDrawn, setCanPlayDrawn] = useState(false);
    const [drawnPlayable, setDrawnPlayable] = useState(null);
    const [lastDrawnCards, setLastDrawnCards] = useState([]);
    const [unoCaller, setUnoCaller] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pendingCard, setPendingCard] = useState(null);

    // Game over state
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(15);

    // Socket event handlers
    useEffect(() => {
        if (!isConnected) return;

        // Room events
        const handleRoomCreated = ({ code, players, isHost }) => {
            setRoomCode(code);
            setPlayers(players);
            setIsHost(isHost);
            setInLobby(true);
            setLobbyError('');
        };

        const handleRoomJoined = ({ code, players, isHost }) => {
            setRoomCode(code);
            setPlayers(players);
            setIsHost(isHost);
            setInLobby(true);
            setLobbyError('');
        };

        const handleJoinError = ({ message }) => {
            setLobbyError(message);
        };

        const handlePlayerJoined = ({ players }) => {
            setPlayers(players);
        };

        const handlePlayerLeft = ({ players }) => {
            setPlayers(players);
        };

        // Game events
        const handleGameStarted = (state) => {
            setGameState(state);
            setIsPlaying(true);
            setGameOver(false);
            setGameResult(null);
            setTimeRemaining(15);
        };

        const handleGameState = (state) => {
            setGameState(state);
            setCanPlayDrawn(false);
            setDrawnPlayable(null);
            // Reset timer when game state updates
            setTimeRemaining(15);
        };

        const handleGameError = ({ message }) => {
            setGameError(message);
            setTimeout(() => setGameError(''), 3000);
        };

        const handleCardsDrawn = ({ cards, canPlayDrawn, drawnPlayable }) => {
            setLastDrawnCards(cards);
            setCanPlayDrawn(canPlayDrawn);
            setDrawnPlayable(drawnPlayable);
        };

        const handleTimeoutPenalty = ({ cards }) => {
            setLastDrawnCards(cards);
            setGameError('Time ran out! +2 penalty cards');
            setTimeout(() => setGameError(''), 3000);
        };

        const handleUnoCalled = ({ playerId, playerName }) => {
            setUnoCaller(playerName);
            setTimeout(() => setUnoCaller(null), 2000);
        };

        const handleGameOver = (result) => {
            setGameOver(true);
            setGameResult(result);
            setIsPlaying(false);
        };

        const handleGameAborted = ({ reason }) => {
            setGameOver(true);
            setGameResult({ aborted: true, reason });
            setIsPlaying(false);
        };

        // Register event listeners
        on('roomCreated', handleRoomCreated);
        on('roomJoined', handleRoomJoined);
        on('joinError', handleJoinError);
        on('playerJoined', handlePlayerJoined);
        on('playerLeft', handlePlayerLeft);
        on('gameStarted', handleGameStarted);
        on('gameState', handleGameState);
        on('gameError', handleGameError);
        on('cardsDrawn', handleCardsDrawn);
        on('timeoutPenalty', handleTimeoutPenalty);
        on('unoCalled', handleUnoCalled);
        on('gameOver', handleGameOver);
        on('gameAborted', handleGameAborted);

        return () => {
            off('roomCreated', handleRoomCreated);
            off('roomJoined', handleRoomJoined);
            off('joinError', handleJoinError);
            off('playerJoined', handlePlayerJoined);
            off('playerLeft', handlePlayerLeft);
            off('gameStarted', handleGameStarted);
            off('gameState', handleGameState);
            off('gameError', handleGameError);
            off('cardsDrawn', handleCardsDrawn);
            off('timeoutPenalty', handleTimeoutPenalty);
            off('unoCalled', handleUnoCalled);
            off('gameOver', handleGameOver);
            off('gameAborted', handleGameAborted);
        };
    }, [isConnected, on, off]);

    // Timer countdown
    useEffect(() => {
        if (!isPlaying || !gameState || gameOver) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 0.1));
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, gameState, gameOver]);

    // Reset timer when turn changes
    useEffect(() => {
        if (gameState?.currentPlayerId) {
            setTimeRemaining(15);
        }
    }, [gameState?.currentPlayerId]);

    // Actions
    const createRoom = useCallback((name) => {
        setPlayerName(name);
        emit('createRoom', { playerName: name });
    }, [emit]);

    const joinRoom = useCallback((code, name) => {
        setPlayerName(name);
        emit('joinRoom', { code: code.toUpperCase(), playerName: name });
    }, [emit]);

    const startGame = useCallback(() => {
        emit('startGame', { code: roomCode });
    }, [emit, roomCode]);

    const playCard = useCallback((cardId, chosenColor = null) => {
        emit('playCard', { code: roomCode, cardId, chosenColor });
        setShowColorPicker(false);
        setPendingCard(null);
    }, [emit, roomCode]);

    const drawCard = useCallback(() => {
        emit('drawCard', { code: roomCode });
    }, [emit, roomCode]);

    const playDrawnCard = useCallback((cardId, chosenColor = null) => {
        emit('playDrawnCard', { code: roomCode, cardId, chosenColor });
        setCanPlayDrawn(false);
        setDrawnPlayable(null);
    }, [emit, roomCode]);

    const skipDrawnCard = useCallback(() => {
        emit('skipDrawnCard', { code: roomCode });
        setCanPlayDrawn(false);
        setDrawnPlayable(null);
    }, [emit, roomCode]);

    const callUno = useCallback(() => {
        emit('callUno', { code: roomCode });
    }, [emit, roomCode]);

    const leaveGame = useCallback(() => {
        setInLobby(false);
        setIsPlaying(false);
        setGameOver(false);
        setGameResult(null);
        setGameState(null);
        setRoomCode('');
        setPlayers([]);
        setIsHost(false);
    }, []);

    const initiatePlayCard = useCallback((card) => {
        if (card.type === 'wild') {
            setPendingCard(card);
            setShowColorPicker(true);
        } else {
            playCard(card.id);
        }
    }, [playCard]);

    const selectColor = useCallback((color) => {
        if (pendingCard) {
            if (canPlayDrawn && drawnPlayable?.id === pendingCard.id) {
                playDrawnCard(pendingCard.id, color);
            } else {
                playCard(pendingCard.id, color);
            }
        }
        setShowColorPicker(false);
        setPendingCard(null);
    }, [pendingCard, canPlayDrawn, drawnPlayable, playCard, playDrawnCard]);

    const value = {
        // State
        playerName,
        roomCode,
        players,
        isHost,
        inLobby,
        lobbyError,
        gameState,
        isPlaying,
        gameError,
        canPlayDrawn,
        drawnPlayable,
        lastDrawnCards,
        unoCaller,
        showColorPicker,
        pendingCard,
        gameOver,
        gameResult,
        timeRemaining,

        // Actions
        createRoom,
        joinRoom,
        startGame,
        playCard,
        drawCard,
        playDrawnCard,
        skipDrawnCard,
        callUno,
        leaveGame,
        initiatePlayCard,
        selectColor,
        setShowColorPicker
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}
