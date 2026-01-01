import React from 'react';
import Card from './Card';
import './PlayerHand.css';

function PlayerHand({ hand, onPlayCard, canPlay, drawStack }) {
    // Check if a card can be played
    const canPlayCard = (card) => {
        if (!canPlay) return false;

        // If there's a draw stack, only draw cards can be played
        if (drawStack > 0) {
            return ['draw2', 'wild_draw4', 'draw6', 'wild_draw6', 'wild_draw10'].includes(card.value);
        }

        return true; // Server will validate the actual play
    };

    return (
        <div className="player-hand-container">
            <div className="hand-label">Your Cards ({hand.length})</div>
            <div className="player-hand">
                {hand.map((card, index) => (
                    <div
                        key={card.id}
                        className="hand-card-wrapper"
                        style={{
                            '--index': index,
                            '--total': hand.length,
                            animationDelay: `${index * 50}ms`
                        }}
                    >
                        <Card
                            card={card}
                            onClick={onPlayCard}
                            disabled={!canPlayCard(card)}
                            animate={false}
                        />
                    </div>
                ))}
            </div>
            {hand.length >= 25 && (
                <div className="danger-warning">
                    ⚠️ Warning: {hand.length} cards! 30 = Game Over!
                </div>
            )}
        </div>
    );
}

export default PlayerHand;
