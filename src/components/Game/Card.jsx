import React from 'react';
import './Card.css';

function Card({
    card,
    onClick,
    disabled = false,
    isBack = false,
    size = 'normal',
    animate = false,
    highlight = false
}) {
    if (isBack) {
        return (
            <div className={`card card-back ${size}`}>
                <div className="card-back-design">
                    <span className="back-text">UNO</span>
                </div>
            </div>
        );
    }

    const getCardColor = () => {
        switch (card.color) {
            case 'red': return 'card-red';
            case 'blue': return 'card-blue';
            case 'green': return 'card-green';
            case 'yellow': return 'card-yellow';
            case 'black': return 'card-black';
            default: return 'card-black';
        }
    };

    const getCardDisplay = () => {
        switch (card.value) {
            case 'skip': return '⊘';
            case 'reverse': return '⟳';
            case 'draw2': return '+2';
            case 'skip_everyone': return '⊗';
            case 'draw6': return '+6';
            case 'wild': return '🌈';
            case 'wild_draw4': return '+4';
            case 'wild_draw6': return '+6';
            case 'wild_draw10': return '+10';
            default: return card.value;
        }
    };

    const getCardLabel = () => {
        switch (card.value) {
            case 'skip': return 'Skip';
            case 'reverse': return 'Reverse';
            case 'draw2': return 'Draw 2';
            case 'skip_everyone': return 'Skip All';
            case 'draw6': return 'Draw 6';
            case 'wild': return 'Wild';
            case 'wild_draw4': return 'Wild +4';
            case 'wild_draw6': return 'Wild +6';
            case 'wild_draw10': return 'Wild +10';
            default: return null;
        }
    };

    const isWild = card.type === 'wild';
    const isActionCard = card.type === 'action' || isWild;
    const label = getCardLabel();

    return (
        <div
            className={`
        card 
        ${getCardColor()} 
        ${size} 
        ${disabled ? 'disabled' : 'playable'}
        ${animate ? 'animate-deal' : ''}
        ${highlight ? 'highlight' : ''}
        ${isWild ? 'wild-card' : ''}
      `}
            onClick={() => !disabled && onClick && onClick(card)}
        >
            <div className="card-inner">
                <span className="card-corner top-left">{getCardDisplay()}</span>
                <span className="card-center">{getCardDisplay()}</span>
                <span className="card-corner bottom-right">{getCardDisplay()}</span>
                {label && <span className="card-label">{label}</span>}
                {isWild && (
                    <div className="wild-colors">
                        <span className="wild-dot red"></span>
                        <span className="wild-dot blue"></span>
                        <span className="wild-dot green"></span>
                        <span className="wild-dot yellow"></span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Card;
