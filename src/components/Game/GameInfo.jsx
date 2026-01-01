import React from 'react';
import './GameInfo.css';

function GameInfo({ direction, drawStack, roomCode, currentPlayerName, unoCaller }) {
    return (
        <div className="game-info">
            <div className="info-item room-code">
                <span className="info-label">Room</span>
                <span className="info-value">{roomCode}</span>
            </div>

            <div className="info-item direction">
                <span className="info-label">Direction</span>
                <span className={`info-value direction-arrow ${direction === 1 ? 'clockwise' : 'counter'}`}>
                    {direction === 1 ? '↻' : '↺'}
                </span>
            </div>

            {drawStack > 0 && (
                <div className="info-item draw-stack-alert">
                    <span className="info-label">Draw Stack</span>
                    <span className="info-value stack-value">+{drawStack}</span>
                </div>
            )}

            {unoCaller && (
                <div className="uno-alert">
                    <span className="uno-text">🎉 {unoCaller} called UNO! 🎉</span>
                </div>
            )}
        </div>
    );
}

export default GameInfo;
