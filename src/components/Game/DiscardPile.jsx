import React from 'react';
import Card from './Card';
import './DiscardPile.css';

function DiscardPile({ topCard, currentColor }) {
    if (!topCard) return null;

    return (
        <div className="discard-pile">
            <div className="pile-label">Discard</div>
            <div className="pile-card">
                <Card card={topCard} disabled size="large" />
            </div>
            {topCard.type === 'wild' && currentColor && (
                <div className={`current-color color-${currentColor}`}>
                    {currentColor.toUpperCase()}
                </div>
            )}
        </div>
    );
}

export default DiscardPile;
