// UNO No-Mercy Game Engine

const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['skip', 'reverse', 'draw2'];
const WILD_CARDS = ['wild', 'wild_draw4'];

// No-Mercy special cards
const NO_MERCY_CARDS = ['skip_everyone', 'draw6', 'draw10'];

class GameEngine {
    constructor(players, roomCode) {
        this.roomCode = roomCode;
        this.players = players.map(p => ({
            id: p.id,
            name: p.name,
            hand: [],
            isUno: false
        }));
        this.deck = [];
        this.discardPile = [];
        this.currentPlayerIndex = 0;
        this.direction = 1; // 1 = clockwise, -1 = counter-clockwise
        this.currentColor = null;
        this.drawStack = 0; // For stacking +2 and +4 cards
        this.status = 'playing';
        this.winner = null;
        this.loser = null;
        this.turnStartTime = null;
        this.turnTimeLimit = 10000; // 10 seconds

        this.initializeDeck();
        this.shuffleDeck();
        this.dealCards();
        this.startFirstCard();
    }

    // Create the UNO No-Mercy deck
    initializeDeck() {
        this.deck = [];

        // Number cards (0 once, 1-9 twice per color)
        for (const color of COLORS) {
            this.deck.push({ type: 'number', color, value: '0' });
            for (let i = 1; i <= 9; i++) {
                this.deck.push({ type: 'number', color, value: i.toString() });
                this.deck.push({ type: 'number', color, value: i.toString() });
            }
        }

        // Action cards (2 of each per color)
        for (const color of COLORS) {
            for (const action of ACTIONS) {
                this.deck.push({ type: 'action', color, value: action });
                this.deck.push({ type: 'action', color, value: action });
            }
        }

        // Wild cards (4 of each)
        for (let i = 0; i < 4; i++) {
            this.deck.push({ type: 'wild', color: 'black', value: 'wild' });
            this.deck.push({ type: 'wild', color: 'black', value: 'wild_draw4' });
        }

        // No-Mercy special cards
        for (const color of COLORS) {
            // Skip Everyone (1 per color)
            this.deck.push({ type: 'action', color, value: 'skip_everyone' });
            // Draw 6 (1 per color)
            this.deck.push({ type: 'action', color, value: 'draw6' });
        }

        // Wild Draw 6 and Draw 10 (2 each)
        for (let i = 0; i < 2; i++) {
            this.deck.push({ type: 'wild', color: 'black', value: 'wild_draw6' });
            this.deck.push({ type: 'wild', color: 'black', value: 'wild_draw10' });
        }

        // Assign unique IDs to each card
        this.deck = this.deck.map((card, index) => ({
            ...card,
            id: `card_${index}_${Date.now()}`
        }));
    }

    // Fisher-Yates shuffle
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // Deal 7 cards to each player
    dealCards() {
        for (let i = 0; i < 7; i++) {
            for (const player of this.players) {
                player.hand.push(this.deck.pop());
            }
        }
    }

    // Start with a valid first card
    startFirstCard() {
        let firstCard;
        do {
            firstCard = this.deck.pop();
            // If it's a wild or action card, put it back and try again
            if (firstCard.type === 'wild' || firstCard.value.includes('draw') || firstCard.value === 'skip_everyone') {
                this.deck.unshift(firstCard);
                this.shuffleDeck();
            } else {
                break;
            }
        } while (true);

        this.discardPile.push(firstCard);
        this.currentColor = firstCard.color;
        this.turnStartTime = Date.now();
    }

    // Get the top card of discard pile
    getTopCard() {
        return this.discardPile[this.discardPile.length - 1];
    }

    // Check if a card can be played
    canPlayCard(card, playerHand) {
        const topCard = this.getTopCard();

        // If there's a draw stack, player must play a matching draw card or draw
        if (this.drawStack > 0) {
            if (card.value === 'draw2' || card.value === 'wild_draw4' ||
                card.value === 'draw6' || card.value === 'wild_draw6' ||
                card.value === 'wild_draw10') {
                return true;
            }
            return false;
        }

        // Wild cards can always be played
        if (card.type === 'wild') {
            return true;
        }

        // Match by color
        if (card.color === this.currentColor) {
            return true;
        }

        // Match by value/number
        if (card.value === topCard.value) {
            return true;
        }

        return false;
    }

    // Play a card
    playCard(playerId, cardId, chosenColor = null) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return { error: 'Player not found' };
        }

        if (playerIndex !== this.currentPlayerIndex) {
            return { error: 'Not your turn' };
        }

        const player = this.players[playerIndex];
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
            return { error: 'Card not in hand' };
        }

        const card = player.hand[cardIndex];
        if (!this.canPlayCard(card, player.hand)) {
            return { error: 'Cannot play this card' };
        }

        // Remove card from hand
        player.hand.splice(cardIndex, 1);
        this.discardPile.push(card);

        // Handle wild card color selection
        if (card.type === 'wild') {
            if (!chosenColor || !COLORS.includes(chosenColor)) {
                return { error: 'Must choose a color for wild card' };
            }
            this.currentColor = chosenColor;
        } else {
            this.currentColor = card.color;
        }

        // Handle special card effects
        this.handleCardEffect(card);

        // Check win condition
        if (player.hand.length === 0) {
            this.status = 'finished';
            this.winner = player;
            return {
                success: true,
                gameOver: true,
                winner: player,
                reason: 'empty_hand'
            };
        }

        // Check UNO status
        player.isUno = player.hand.length === 1;

        // Move to next player
        this.nextTurn();

        return { success: true };
    }

    // Handle special card effects
    handleCardEffect(card) {
        const numPlayers = this.players.length;

        switch (card.value) {
            case 'skip':
                // Skip next player
                this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + numPlayers) % numPlayers;
                break;

            case 'reverse':
                // Reverse direction (acts as skip in 2-player)
                if (numPlayers === 2) {
                    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + numPlayers) % numPlayers;
                } else {
                    this.direction *= -1;
                }
                break;

            case 'skip_everyone':
                // Skip all other players (current player goes again)
                // No change to currentPlayerIndex needed, nextTurn will be called
                this.currentPlayerIndex = (this.currentPlayerIndex - this.direction + numPlayers) % numPlayers;
                break;

            case 'draw2':
                this.drawStack += 2;
                break;

            case 'draw6':
                this.drawStack += 6;
                break;

            case 'wild_draw4':
                this.drawStack += 4;
                break;

            case 'wild_draw6':
                this.drawStack += 6;
                break;

            case 'wild_draw10':
                this.drawStack += 10;
                break;
        }
    }

    // Move to next player's turn
    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
        this.turnStartTime = Date.now();
    }

    // Draw cards for current player
    drawCards(playerId, count = 1) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return { error: 'Player not found' };
        }

        const player = this.players[playerIndex];
        const drawnCards = [];

        for (let i = 0; i < count; i++) {
            // Reshuffle discard pile if deck is empty
            if (this.deck.length === 0) {
                this.reshuffleDeck();
            }

            if (this.deck.length > 0) {
                const card = this.deck.pop();
                player.hand.push(card);
                drawnCards.push(card);
            }
        }

        // Check lose condition (30+ cards)
        if (player.hand.length >= 30) {
            this.status = 'finished';
            this.loser = player;
            // Find a winner (player with fewest cards)
            const otherPlayers = this.players.filter(p => p.id !== playerId);
            this.winner = otherPlayers.reduce((min, p) => p.hand.length < min.hand.length ? p : min, otherPlayers[0]);
            return {
                drawnCards,
                gameOver: true,
                loser: player,
                winner: this.winner,
                reason: 'too_many_cards'
            };
        }

        player.isUno = false;

        return { drawnCards };
    }

    // Handle draw action (including stacked draws)
    handleDraw(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return { error: 'Player not found' };
        }

        if (playerIndex !== this.currentPlayerIndex) {
            return { error: 'Not your turn' };
        }

        let drawCount = this.drawStack > 0 ? this.drawStack : 1;
        this.drawStack = 0;

        const result = this.drawCards(playerId, drawCount);

        if (result.gameOver) {
            return result;
        }

        // No-Mercy rule: Draw until you can play (if not drawing from stack)
        if (drawCount === 1) {
            const player = this.players[playerIndex];
            const lastDrawn = result.drawnCards[result.drawnCards.length - 1];

            // Check if drawn card can be played
            if (this.canPlayCard(lastDrawn, player.hand)) {
                // Player can choose to play the drawn card
                result.canPlayDrawn = true;
                result.drawnPlayable = lastDrawn;
            } else {
                // Must draw until playable (No-Mercy rule) - up to 5 more cards
                let extraDraws = 0;
                while (extraDraws < 5 && this.deck.length > 0) {
                    const extraResult = this.drawCards(playerId, 1);
                    if (extraResult.gameOver) {
                        return extraResult;
                    }
                    result.drawnCards.push(...extraResult.drawnCards);
                    const newCard = extraResult.drawnCards[0];
                    if (this.canPlayCard(newCard, player.hand)) {
                        result.canPlayDrawn = true;
                        result.drawnPlayable = newCard;
                        break;
                    }
                    extraDraws++;
                }
            }
        }

        // If no playable card found, move to next turn
        if (!result.canPlayDrawn) {
            this.nextTurn();
        }

        return result;
    }

    // Apply timeout penalty (2 cards)
    applyTimeoutPenalty(playerId) {
        const result = this.drawCards(playerId, 2);
        if (!result.gameOver) {
            this.nextTurn();
        }
        return {
            penalty: true,
            ...result
        };
    }

    // Reshuffle discard pile into deck
    reshuffleDeck() {
        if (this.discardPile.length <= 1) return;

        const topCard = this.discardPile.pop();
        this.deck = [...this.discardPile];
        this.discardPile = [topCard];
        this.shuffleDeck();
    }

    // Get current player
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // Get game state for a specific player
    getStateForPlayer(playerId) {
        const playerData = this.players.find(p => p.id === playerId);

        return {
            roomCode: this.roomCode,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                cardCount: p.hand.length,
                isUno: p.isUno,
                isCurrentTurn: p.id === this.getCurrentPlayer().id,
                hand: p.id === playerId ? p.hand : undefined
            })),
            myHand: playerData ? playerData.hand : [],
            topCard: this.getTopCard(),
            currentColor: this.currentColor,
            currentPlayerId: this.getCurrentPlayer().id,
            direction: this.direction,
            drawStack: this.drawStack,
            deckCount: this.deck.length,
            status: this.status,
            winner: this.winner,
            loser: this.loser,
            turnStartTime: this.turnStartTime,
            turnTimeLimit: this.turnTimeLimit
        };
    }

    // Check if it's the player's turn
    isPlayerTurn(playerId) {
        return this.getCurrentPlayer().id === playerId;
    }

    // Get time remaining for current turn
    getTimeRemaining() {
        const elapsed = Date.now() - this.turnStartTime;
        return Math.max(0, this.turnTimeLimit - elapsed);
    }
}

export default GameEngine;
