import React from 'react';
import './Timer.css';

function Timer({ timeRemaining, isMyTurn }) {
    const percentage = (timeRemaining / 15) * 100;
    const isLow = timeRemaining <= 5;
    const isCritical = timeRemaining <= 2;

    return (
        <div className={`timer ${isMyTurn ? 'active' : ''} ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}>
            <div className="timer-circle">
                <svg viewBox="0 0 100 100">
                    <circle
                        className="timer-bg"
                        cx="50"
                        cy="50"
                        r="45"
                    />
                    <circle
                        className="timer-progress"
                        cx="50"
                        cy="50"
                        r="45"
                        style={{
                            strokeDasharray: `${percentage * 2.83} 283`,
                            strokeDashoffset: 0
                        }}
                    />
                </svg>
                <span className="timer-text">
                    {Math.ceil(timeRemaining)}
                </span>
            </div>
            {isMyTurn && (
                <span className="timer-label">Your Turn</span>
            )}
        </div>
    );
}

export default Timer;
