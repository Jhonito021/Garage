// frontend/src/components/DepannageButton.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { demanderDepannage } from '../services/depannageApi';

function DepannageButton({ onSuccess, variant = 'primary' }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleClick = async () => {
        const confirm = window.confirm(
            '⚠️ CONFIRMATION DÉPANNAGE\n\n' +
            'Une dépanneuse sera envoyée à votre position GPS.\n\n' +
            'Souhaitez-vous continuer ?'
        );
        
        if (!confirm) return;

        setLoading(true);
        setStatus('loading');

        try {
            const result = await demanderDepannage();
            setStatus('success');
            
            if (onSuccess) {
                onSuccess(result.position, result.demandeId);
            }
            
            alert(`✅ Demande envoyée !\nDépanneuse en route vers votre position.`);
            
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            setStatus('error');
            alert(`❌ Erreur: ${error.message}`);
            setTimeout(() => setStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getButtonStyle = () => {
        if (status === 'success') return { backgroundColor: '#4caf50' };
        if (status === 'error') return { backgroundColor: '#f44336' };
        return variant === 'primary' ? { backgroundColor: '#e94560' } : {};
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            style={{
                ...getButtonStyle(),
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                justifyContent: 'center'
            }}
        >
            {status === 'loading' && <FontAwesomeIcon icon={faSpinner} spin />}
            {status === 'success' && <FontAwesomeIcon icon={faCheck} />}
            {status === 'error' && <FontAwesomeIcon icon={faTimes} />}
            {!status && <FontAwesomeIcon icon={faTruck} />}
            
            {status === 'loading' && "Envoi en cours..."}
            {status === 'success' && "Demande envoyée !"}
            {status === 'error' && "Erreur"}
            {!status && "🚛 Appeler un dépannage d'urgence"}
        </button>
    );
}

export default DepannageButton;