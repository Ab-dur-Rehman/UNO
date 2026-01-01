import React from 'react';
import { useGame } from '../../context/GameContext';
import './GameOver.css';

function GameOver() {
    const { gameResult, playerName, leaveGame } = useGame();

    if (!gameResult) return null;

    // Handle aborted game
    if (gameResult.aborted) {
        return (
            <div className="game-over-container">
                <div className="game-over-modal glass-card animate-scale-in">
                    <div className="game-over-icon">😔</div>
                    <h2>Game Aborted</h2>
                    <p className="game-over-reason">{gameResult.reason}</p>
                    <button className="btn btn-primary" onClick={leaveGame}>
                        Back to Lobby
                    </button>
                </div>
            </div>
        );
    }

    const isWinner = gameResult.winner?.name === playerName;
    const isLoser = gameResult.loser?.name === playerName;

    const getReasonText = () => {
        switch (gameResult.reason) {
            case 'empty_hand':
                return `${gameResult.winner?.name} played all their cards!`;
            case 'too_many_cards':
                return `${gameResult.loser?.name} accumulated 30+ cards!`;
            default:
                return 'Game Over';
        }
    };

    return (
        <div className="game-over-container">
            <div className="game-over-modal glass-card animate-scale-in">
                {isWinner ? (
                    <>
                        <div className="game-over-icon winner">🏆</div>
                        <h2 className="winner-text">You Win!</h2>
                        <div className="confetti">
                            {Array.from({ length: 50 }).map((_, i) => (
                                <span
                                    key={i}
                                    className="confetti-piece"
                                    style={{
                                        '--x': Math.random(),
                                        '--delay': Math.random() * 2,
                                        '--color': ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'][i % 5]
                                    }}
                                />
                            ))}
                        </div>
                    </>
                ) : isLoser ? (
                    <>
                        <div className="game-over-icon loser">💀</div>
                        <h2 className="loser-text">Game Over</h2>
                        <p className="loser-subtitle">You accumulated too many cards!</p>
                    </>
                ) : (
                    <>
                        <div className="game-over-icon">🎮</div>
                        <h2>Game Over</h2>
                        <p className="winner-announcement">
                            {gameResult.winner?.name} wins!
                        </p>
                    </>
                )}

                <p className="game-over-reason">{getReasonText()}</p>

                <div className="game-over-stats">
                    <div className="stat">
                        <span className="stat-label">Winner</span>
                        <span className="stat-value">{gameResult.winner?.name || 'N/A'}</span>
                    </div>
                    {gameResult.loser && (
                        <div className="stat">
                            <span className="stat-label">30+ Cards</span>
                            <span className="stat-value">{gameResult.loser.name}</span>
                        </div>
                    )}
                </div>

                <button className="btn btn-primary" onClick={leaveGame}>
                    Back to Lobby
                </button>
            </div>
        </div>
    );
}

export default GameOver;
