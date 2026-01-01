import React from 'react';
import Card from './Card';
import './OpponentHand.css';

function OpponentHand({ player, position, isCurrentTurn }) {
    const cardCount = player.cardCount;
    const displayCards = Math.min(cardCount, 10); // Show max 10 card backs

    return (
        <div className={`opponent-hand position-${position} ${isCurrentTurn ? 'current-turn' : ''}`}>
            <div className="opponent-info">
                <div className={`opponent-avatar ${isCurrentTurn ? 'active' : ''}`}>
                    {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="opponent-name">{player.name}</span>
                <span className="card-count">{cardCount} cards</span>
                {player.isUno && <span className="uno-badge">UNO!</span>}
            </div>
            <div className="opponent-cards">
                {Array.from({ length: displayCards }).map((_, index) => (
                    <div
                        key={index}
                        className="opponent-card-wrapper"
                        style={{ '--index': index }}
                    >
                        <Card isBack size="small" />
                    </div>
                ))}
                {cardCount > 10 && (
                    <div className="more-cards">+{cardCount - 10}</div>
                )}
            </div>
            {isCurrentTurn && <div className="turn-indicator">Playing...</div>}
        </div>
    );
}

export default OpponentHand;
