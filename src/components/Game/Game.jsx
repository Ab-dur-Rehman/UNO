import React from 'react';
import { useGame } from '../../context/GameContext';
import { useSocket } from '../../context/SocketContext';
import PlayerHand from './PlayerHand';
import OpponentHand from './OpponentHand';
import DiscardPile from './DiscardPile';
import DrawPile from './DrawPile';
import Timer from './Timer';
import GameInfo from './GameInfo';
import ColorPicker from './ColorPicker';
import Card from './Card';
import RulesModal from './RulesModal';
import './Game.css';

function Game() {
    const { socket } = useSocket();
    const {
        gameState,
        gameError,
        showColorPicker,
        canPlayDrawn,
        drawnPlayable,
        unoCaller,
        timeRemaining,
        initiatePlayCard,
        drawCard,
        playDrawnCard,
        skipDrawnCard,
        callUno,
        selectColor,
        setShowColorPicker
    } = useGame();

    const [showRules, setShowRules] = React.useState(false);

    if (!gameState) {
        return (
            <div className="game-loading">
                <div className="loading-spinner"></div>
                <p>Loading game...</p>
            </div>
        );
    }

    const myId = socket?.id;
    const isMyTurn = gameState.currentPlayerId === myId;
    const opponents = gameState.players.filter(p => p.id !== myId);

    // Get opponent positions based on count
    const getOpponentPosition = (index, total) => {
        if (total === 1) return 'top';
        if (total === 2) return index === 0 ? 'top-left' : 'top-right';
        if (total === 3) {
            if (index === 0) return 'left';
            if (index === 1) return 'top';
            return 'right';
        }
        // 4+ opponents
        const positions = ['left', 'top-left', 'top', 'top-right', 'right'];
        return positions[index % positions.length];
    };

    const handlePlayCard = (card) => {
        if (!isMyTurn && !canPlayDrawn) return;

        if (canPlayDrawn && drawnPlayable) {
            // Playing the drawn card
            if (card.id === drawnPlayable.id) {
                if (card.type === 'wild') {
                    initiatePlayCard(card);
                } else {
                    playDrawnCard(card.id);
                }
            }
        } else {
            initiatePlayCard(card);
        }
    };

    const handleDrawCard = () => {
        if (!isMyTurn) return;
        drawCard();
    };

    const handleCallUno = () => {
        callUno();
    };

    const handleSkipDrawn = () => {
        skipDrawnCard();
    };

    return (
        <div className="game-container">
            {/* Game Info */}
            <div className="game-status-bar">
                <GameInfo
                    direction={gameState.direction}
                    drawStack={gameState.drawStack}
                    roomCode={gameState.roomCode}
                    currentPlayerName={gameState.players.find(p => p.id === gameState.currentPlayerId)?.name}
                    unoCaller={unoCaller}
                />
                <button
                    className="rules-button"
                    onClick={() => setShowRules(true)}
                    title="How to Play"
                >
                    ?
                </button>
            </div>

            {/* Opponents */}
            <div className="opponents-container">
                {opponents.map((player, index) => (
                    <OpponentHand
                        key={player.id}
                        player={player}
                        position={getOpponentPosition(index, opponents.length)}
                        isCurrentTurn={player.id === gameState.currentPlayerId}
                    />
                ))}
            </div>

            {/* Game Board Center */}
            <div className="game-board">
                <DrawPile
                    deckCount={gameState.deckCount}
                    onClick={handleDrawCard}
                    disabled={!isMyTurn || canPlayDrawn}
                    drawStack={gameState.drawStack}
                />

                <DiscardPile
                    topCard={gameState.topCard}
                    currentColor={gameState.currentColor}
                />

                <div className="timer-container">
                    <Timer
                        timeRemaining={timeRemaining}
                        isMyTurn={isMyTurn}
                    />
                </div>
            </div>

            {/* UNO Button */}
            {gameState.myHand?.length === 2 && isMyTurn && (
                <button className="uno-button" onClick={handleCallUno}>
                    UNO!
                </button>
            )}

            {/* Drawn Card Option */}
            {canPlayDrawn && drawnPlayable && (
                <div className="drawn-card-option animate-scale-in">
                    <p>Play this card?</p>
                    <div className="drawn-card-preview">
                        <Card
                            card={drawnPlayable}
                            onClick={() => handlePlayCard(drawnPlayable)}
                        />
                    </div>
                    <div className="drawn-card-actions">
                        <button className="btn btn-primary" onClick={() => handlePlayCard(drawnPlayable)}>
                            Play
                        </button>
                        <button className="btn btn-secondary" onClick={handleSkipDrawn}>
                            Keep
                        </button>
                    </div>
                </div>
            )}

            {/* Player Hand */}
            <PlayerHand
                hand={gameState.myHand || []}
                onPlayCard={handlePlayCard}
                canPlay={isMyTurn && !canPlayDrawn}
                drawStack={gameState.drawStack}
            />

            {/* Color Picker Modal */}
            {showColorPicker && (
                <ColorPicker
                    onSelect={selectColor}
                    onCancel={() => setShowColorPicker(false)}
                />
            )}

            {/* Rules Modal */}
            {showRules && (
                <RulesModal onClose={() => setShowRules(false)} />
            )}

            {/* Error Toast */}
            {gameError && (
                <div className="game-error-toast animate-slide-up">
                    {gameError}
                </div>
            )}

            {/* Turn Indicator */}
            {isMyTurn && !canPlayDrawn && (
                <div className="turn-banner">
                    Your Turn!
                    {gameState.drawStack > 0
                        ? ` Draw ${gameState.drawStack} or play a draw card!`
                        : ' Play a card or draw'}
                </div>
            )}
        </div>
    );
}

export default Game;
