// UNO No-Mercy Server
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import RoomManager from './game/RoomManager.js';
import GameEngine from './game/GameEngine.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const roomManager = new RoomManager();
const activeGames = new Map(); // roomCode -> GameEngine
const turnTimers = new Map(); // roomCode -> timer

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'UNO No-Mercy Server Running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new room
    socket.on('createRoom', ({ playerName }) => {
        const room = roomManager.createRoom(socket.id, playerName);
        socket.join(room.code);
        socket.emit('roomCreated', {
            code: room.code,
            players: room.players,
            isHost: true
        });
        console.log(`Room ${room.code} created by ${playerName}`);
    });

    // Join an existing room
    socket.on('joinRoom', ({ code, playerName }) => {
        const result = roomManager.joinRoom(code, socket.id, playerName);

        if (result.error) {
            socket.emit('joinError', { message: result.error });
            return;
        }

        socket.join(code);
        socket.emit('roomJoined', {
            code,
            players: result.room.players,
            isHost: false
        });

        // Notify all players in the room
        io.to(code).emit('playerJoined', {
            players: result.room.players,
            newPlayer: playerName
        });

        console.log(`${playerName} joined room ${code}`);
    });

    // Start the game (host only)
    socket.on('startGame', ({ code }) => {
        const room = roomManager.getRoom(code);

        if (!room) {
            socket.emit('gameError', { message: 'Room not found' });
            return;
        }

        if (room.hostId !== socket.id) {
            socket.emit('gameError', { message: 'Only host can start the game' });
            return;
        }

        if (room.players.length < 2) {
            socket.emit('gameError', { message: 'Need at least 2 players to start' });
            return;
        }

        // Create game engine
        const game = new GameEngine(room.players, code);
        activeGames.set(code, game);
        roomManager.setRoomStatus(code, 'playing');

        // Send initial game state to each player
        for (const player of room.players) {
            io.to(player.id).emit('gameStarted', game.getStateForPlayer(player.id));
        }

        // Start turn timer
        startTurnTimer(code);

        console.log(`Game started in room ${code}`);
    });

    // Play a card
    socket.on('playCard', ({ code, cardId, chosenColor }) => {
        const game = activeGames.get(code);

        if (!game) {
            socket.emit('gameError', { message: 'Game not found' });
            return;
        }

        if (!game.isPlayerTurn(socket.id)) {
            socket.emit('gameError', { message: 'Not your turn' });
            return;
        }

        const result = game.playCard(socket.id, cardId, chosenColor);

        if (result.error) {
            socket.emit('gameError', { message: result.error });
            return;
        }

        // Clear and reset turn timer
        clearTurnTimer(code);

        if (result.gameOver) {
            handleGameOver(code, result);
        } else {
            // Update all players with new game state
            broadcastGameState(code, game);
            startTurnTimer(code);
        }
    });

    // Draw cards
    socket.on('drawCard', ({ code }) => {
        const game = activeGames.get(code);

        if (!game) {
            socket.emit('gameError', { message: 'Game not found' });
            return;
        }

        if (!game.isPlayerTurn(socket.id)) {
            socket.emit('gameError', { message: 'Not your turn' });
            return;
        }

        const result = game.handleDraw(socket.id);

        if (result.error) {
            socket.emit('gameError', { message: result.error });
            return;
        }

        // Clear turn timer
        clearTurnTimer(code);

        if (result.gameOver) {
            handleGameOver(code, result);
        } else {
            // Notify the player about drawn cards
            socket.emit('cardsDrawn', {
                cards: result.drawnCards,
                canPlayDrawn: result.canPlayDrawn,
                drawnPlayable: result.drawnPlayable
            });

            // Update all players with new game state
            broadcastGameState(code, game);

            // If player can play drawn card, wait for their action
            // Otherwise start next player's timer
            if (!result.canPlayDrawn) {
                startTurnTimer(code);
            }
        }
    });

    // Play the drawn card
    socket.on('playDrawnCard', ({ code, cardId, chosenColor }) => {
        const game = activeGames.get(code);

        if (!game) {
            socket.emit('gameError', { message: 'Game not found' });
            return;
        }

        const result = game.playCard(socket.id, cardId, chosenColor);

        if (result.error) {
            socket.emit('gameError', { message: result.error });
            return;
        }

        if (result.gameOver) {
            handleGameOver(code, result);
        } else {
            broadcastGameState(code, game);
            startTurnTimer(code);
        }
    });

    // Skip playing the drawn card
    socket.on('skipDrawnCard', ({ code }) => {
        const game = activeGames.get(code);

        if (!game) {
            socket.emit('gameError', { message: 'Game not found' });
            return;
        }

        game.nextTurn();
        broadcastGameState(code, game);
        startTurnTimer(code);
    });

    // Call UNO
    socket.on('callUno', ({ code }) => {
        const game = activeGames.get(code);
        if (!game) return;

        const room = roomManager.getRoom(code);
        if (!room) return;

        // Broadcast UNO call to all players
        io.to(code).emit('unoCalled', {
            playerId: socket.id,
            playerName: room.players.find(p => p.id === socket.id)?.name
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        const result = roomManager.removePlayer(socket.id);

        if (result) {
            const { room, roomDeleted } = result;

            if (roomDeleted) {
                // Clean up game
                clearTurnTimer(room.code);
                activeGames.delete(room.code);
                console.log(`Room ${room.code} deleted`);
            } else {
                // Notify remaining players
                io.to(room.code).emit('playerLeft', {
                    players: room.players,
                    leftPlayerId: socket.id
                });

                // If game was in progress, end it
                if (activeGames.has(room.code)) {
                    io.to(room.code).emit('gameAborted', {
                        reason: 'A player disconnected'
                    });
                    clearTurnTimer(room.code);
                    activeGames.delete(room.code);
                    roomManager.setRoomStatus(room.code, 'waiting');
                }
            }
        }
    });
});

// Turn timer functions
function startTurnTimer(code) {
    clearTurnTimer(code);

    const timer = setTimeout(() => {
        const game = activeGames.get(code);
        if (!game || game.status !== 'playing') return;

        const currentPlayer = game.getCurrentPlayer();
        const result = game.applyTimeoutPenalty(currentPlayer.id);

        // Notify the player about the penalty
        io.to(currentPlayer.id).emit('timeoutPenalty', {
            cards: result.drawnCards
        });

        if (result.gameOver) {
            handleGameOver(code, result);
        } else {
            broadcastGameState(code, game);
            startTurnTimer(code);
        }
    }, 10000); // 10 seconds

    turnTimers.set(code, timer);
}

function clearTurnTimer(code) {
    const timer = turnTimers.get(code);
    if (timer) {
        clearTimeout(timer);
        turnTimers.delete(code);
    }
}

// Broadcast game state to all players
function broadcastGameState(code, game) {
    const room = roomManager.getRoom(code);
    if (!room) return;

    for (const player of room.players) {
        io.to(player.id).emit('gameState', game.getStateForPlayer(player.id));
    }
}

// Handle game over
function handleGameOver(code, result) {
    clearTurnTimer(code);

    const room = roomManager.getRoom(code);
    if (!room) return;

    io.to(code).emit('gameOver', {
        winner: result.winner,
        loser: result.loser,
        reason: result.reason
    });

    activeGames.delete(code);
    roomManager.setRoomStatus(code, 'finished');
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🎮 UNO No-Mercy Server running on port ${PORT}`);
});
