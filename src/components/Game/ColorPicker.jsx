import React from 'react';
import './ColorPicker.css';

function ColorPicker({ onSelect, onCancel }) {
    const colors = [
        { name: 'red', label: 'Red' },
        { name: 'blue', label: 'Blue' },
        { name: 'green', label: 'Green' },
        { name: 'yellow', label: 'Yellow' }
    ];

    return (
        <div className="color-picker-overlay" onClick={onCancel}>
            <div className="color-picker-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3>Choose a Color</h3>
                <div className="color-options">
                    {colors.map((color) => (
                        <button
                            key={color.name}
                            className={`color-option color-${color.name}`}
                            onClick={() => onSelect(color.name)}
                        >
                            <span className="color-circle"></span>
                            <span className="color-label">{color.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ColorPicker;
