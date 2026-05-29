// frontend/src/components/ThemeToggle.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Changer de thème"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}
        >
            {theme === 'dark' ? (
                <FontAwesomeIcon icon={faSun} style={{ color: '#ff9800' }} />
            ) : (
                <FontAwesomeIcon icon={faMoon} style={{ color: '#e94560' }} />
            )}
        </button>
    );
}

export default ThemeToggle;