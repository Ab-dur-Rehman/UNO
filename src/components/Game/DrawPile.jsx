import React from 'react';
import Card from './Card';
import './DrawPile.css';

function DrawPile({ deckCount, onClick, disabled, drawStack }) {
    return (
        <div className="draw-pile">
            <div className="pile-label">
                Draw {drawStack > 0 && <span className="draw-stack">+{drawStack}</span>}
            </div>
            <div
                className={`pile-cards ${disabled ? 'disabled' : 'active'}`}
                onClick={() => !disabled && onClick()}
            >
                <div className="pile-stack">
                    <Card isBack size="large" />
                    <Card isBack size="large" />
                    <Card isBack size="large" />
                </div>
                <div className="deck-count">{deckCount}</div>
                {!disabled && (
                    <div className="draw-hint">Click to draw</div>
                )}
            </div>
        </div>
    );
}

export default DrawPile;
