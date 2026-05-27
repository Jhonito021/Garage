// frontend/src/components/DepanneurDemandesList.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPhone, 
    faClock, 
    faLocationDot, 
    faCheckCircle, 
    faHourglassHalf, 
    faTruck, 
    faEye,
    faSearch,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

// Styles par statut
const getStatusStyle = (statut) => {
    switch(statut) {
        case 'en_attente': 
            return { 
                bg: 'rgba(255, 152, 0, 0.15)', 
                color: '#ff9800', 
                text: 'En attente', 
                icon: faHourglassHalf,
                border: '#ff9800'
            };
        case 'acceptee': 
            return { 
                bg: 'rgba(76, 175, 80, 0.15)', 
                color: '#4caf50', 
                text: 'En cours', 
                icon: faTruck,
                border: '#4caf50'
            };
        case 'terminee': 
            return { 
                bg: 'rgba(33, 150, 243, 0.15)', 
                color: '#2196f3', 
                text: 'Terminée', 
                icon: faCheckCircle,
                border: '#2196f3'
            };
        default: 
            return { 
                bg: 'rgba(158, 158, 158, 0.1)', 
                color: '#9e9e9e', 
                text: statut, 
                icon: faClock,
                border: '#9e9e9e'
            };
    }
};

// Formater les coordonnées
const formatCoordinate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0000' : num.toFixed(4);
};

// Formater la date
const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function DepanneurDemandesList({ demandes, selectedDemande, onSelectDemande, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date'); // date, distance

    // Filtrer les demandes par recherche
    const filteredDemandes = demandes.filter(demande => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            demande.client_nom?.toLowerCase().includes(searchLower) ||
            demande.client_prenom?.toLowerCase().includes(searchLower) ||
            demande.client_telephone?.includes(searchLower)
        );
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>
                    <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px', color: '#e94560' }} />
                    Missions ({filteredDemandes.length})
                </h2>
                <button onClick={onRefresh} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <FontAwesomeIcon icon={faSearch} style={{ marginRight: '5px' }} />
                    Actualiser
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="card" style={{ marginBottom: '15px', padding: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginBottom: 0, padding: '8px 12px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setSortBy('date')}
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px',
                                backgroundColor: sortBy === 'date' ? '#e94560' : 'transparent',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                            Date
                        </button>
                        <button 
                            onClick={() => setSortBy('distance')}
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px',
                                backgroundColor: sortBy === 'distance' ? '#e94560' : 'transparent',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '5px' }} />
                            Distance
                        </button>
                    </div>
                </div>
            </div>

            {filteredDemandes.length === 0 ? (
                <div className="card text-center" style={{ padding: '40px' }}>
                    <FontAwesomeIcon icon={faTruck} size="2x" style={{ color: 'var(--text-light)', marginBottom: '15px' }} />
                    <p>Aucune mission trouvée</p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="btn-outline mt-10">
                            Effacer la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '650px', overflowY: 'auto', paddingRight: '5px' }}>
                    {filteredDemandes.map(demande => {
                        const status = getStatusStyle(demande.statut);
                        const isSelected = selectedDemande?.id === demande.id;
                        
                        return (
                            <div 
                                key={demande.id} 
                                className="card"
                                style={{ 
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid ${status.color}` : '1px solid var(--border-color)',
                                    transition: 'all 0.2s ease',
                                    padding: '15px',
                                    backgroundColor: isSelected ? 'rgba(233, 69, 96, 0.05)' : undefined
                                }}
                                onClick={() => onSelectDemande(demande)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        {/* En-tête avec nom et statut */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>
                                                {demande.client_prenom} {demande.client_nom}
                                            </h4>
                                            <span style={{ 
                                                backgroundColor: status.bg, 
                                                color: status.color,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <FontAwesomeIcon icon={status.icon} />
                                                {status.text}
                                            </span>
                                        </div>
                                        
                                        {/* Téléphone */}
                                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '5px' }}>
                                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '6px', width: '14px' }} />
                                            {demande.client_telephone || 'Pas de téléphone'}
                                        </p>
                                        
                                        {/* Date */}
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                                            <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px', width: '14px' }} />
                                            {formatDate(demande.date_demande)}
                                        </p>
                                        
                                        {/* Coordonnées */}
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 0 }}>
                                            <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '6px', width: '14px' }} />
                                            {formatCoordinate(demande.lat)}, {formatCoordinate(demande.lng)}
                                        </p>
                                    </div>
                                    
                                    {/* Bouton voir */}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            onSelectDemande(demande); 
                                        }} 
                                        style={{ 
                                            backgroundColor: isSelected ? status.color : 'transparent',
                                            border: `1px solid ${status.color}`,
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            color: isSelected ? 'white' : status.color
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                                        {isSelected ? 'Sélectionné' : 'Voir'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DepanneurDemandesList;