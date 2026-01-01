// Room Manager - Handles game lobbies and invitation codes

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Generate a unique 6-character invitation code
  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  // Create a new room
  createRoom(hostId, hostName) {
    const code = this.generateCode();
    const room = {
      code,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        isReady: true
      }],
      status: 'waiting', // waiting, playing, finished
      gameState: null,
      createdAt: Date.now()
    };
    this.rooms.set(code, room);
    return room;
  }

  // Join an existing room
  joinRoom(code, playerId, playerName) {
    const room = this.rooms.get(code);
    if (!room) {
      return { error: 'Room not found' };
    }
    if (room.status !== 'waiting') {
      return { error: 'Game already in progress' };
    }
    if (room.players.find(p => p.id === playerId)) {
      return { error: 'Already in room' };
    }
    
    room.players.push({
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false
    });
    
    return { room };
  }

  // Get room by code
  getRoom(code) {
    return this.rooms.get(code);
  }

  // Get room by player ID
  getRoomByPlayerId(playerId) {
    for (const room of this.rooms.values()) {
      if (room.players.find(p => p.id === playerId)) {
        return room;
      }
    }
    return null;
  }

  // Remove player from room
  removePlayer(playerId) {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    
    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(room.code);
      return { roomDeleted: true, room };
    }
    
    // If host left, assign new host
    if (!room.players.find(p => p.isHost) && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
    }
    
    return { roomDeleted: false, room };
  }

  // Update room game state
  updateGameState(code, gameState) {
    const room = this.rooms.get(code);
    if (room) {
      room.gameState = gameState;
    }
  }

  // Set room status
  setRoomStatus(code, status) {
    const room = this.rooms.get(code);
    if (room) {
      room.status = status;
    }
  }

  // Delete room
  deleteRoom(code) {
    this.rooms.delete(code);
  }
}

export default RoomManager;
