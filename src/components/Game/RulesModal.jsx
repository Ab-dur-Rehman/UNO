import React from 'react';
import './RulesModal.css';

const RulesModal = ({ onClose }) => {
    return (
        <div className="rules-modal-overlay" onClick={onClose}>
            <div className="rules-modal-content" onClick={e => e.stopPropagation()}>
                <div className="rules-header">
                    <h2>UNO No-Mercy Rules</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="rules-body">
                    <section className="rule-section">
                        <h3>Stacking Rules</h3>
                        <div className="rule-item">
                            <h4>Colored Draw Cards (+2, +6 etc)</h4>
                            <ul>
                                <li>If a colored +Card is played (e.g., +2 Green):</li>
                                <li>You can play a +Card of the <strong>SAME VALUE</strong> (any color).</li>
                                <li>You can play a +Card of <strong>HIGHER VALUE</strong> (must be SAME color).</li>
                                <li><strong>NO</strong> Black/Wild cards can be played on colored draw cards.</li>
                            </ul>
                        </div>
                        <div className="rule-item">
                            <h4>Black Draw Cards (Wild +4, +6, +10)</h4>
                            <ul>
                                <li>If a Black +Card is played:</li>
                                <li>You can play a Black +Card of <strong>EQUAL OR HIGHER VALUE</strong>.</li>
                                <li><strong>NO</strong> Colored cards can be played on Black cards.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="rule-section">
                        <h3>Special Cards</h3>
                        <ul>
                            <li><strong>Skip Everyone:</strong> Skips all other players and gives you another turn.</li>
                            <li><strong>Draw 6 / Draw 10:</strong> Forces the next player to draw cards. Can be stacked!</li>
                            <li><strong>Mercy Rule:</strong> If you have 25 or more cards in your hand, you undergo the Mercy Rule and are eliminated! (Game Engine checks for 30).</li>
                        </ul>
                    </section>
                </div>

                <div className="rules-footer">
                    <button className="btn btn-primary" onClick={onClose}>Got it!</button>
                </div>
            </div>
        </div>
    );
};

export default RulesModal;
