// frontend/src/components/AdminNotification.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTruck, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getDemandesDepannage, accepterDemande, refuserDemande } from '../services/depannageApi';

function AdminNotification({ onDemandeAcceptee }) {
    const [demandes, setDemandes] = useState([]);
    const [showList, setShowList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchDemandes = async () => {
        setLoading(true);
        try {
            const data = await getDemandesDepannage();
            const enAttente = data.filter(d => d.statut === 'en_attente');
            setDemandes(enAttente);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
        const interval = setInterval(fetchDemandes, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAccepter = async (demandeId) => {
        setActionLoading(demandeId);
        try {
            await accepterDemande(demandeId);
            await fetchDemandes();
            if (onDemandeAcceptee) {
                const demande = demandes.find(d => d.id === demandeId);
                onDemandeAcceptee(demande);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'acceptation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefuser = async (demandeId) => {
        setActionLoading(demandeId);
        try {
            await refuserDemande(demandeId);
            await fetchDemandes();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du refus');
        } finally {
            setActionLoading(null);
        }
    };

    const unreadCount = demandes.length;

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowList(!showList)}
                style={{
                    position: 'relative',
                    backgroundColor: 'transparent',
                    padding: '10px',
                    fontSize: '1.2rem'
                }}
            >
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showList && (
                <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: '0',
                    width: '350px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid var(--border-color)',
                        fontWeight: 'bold'
                    }}>
                        🚨 Demandes de dépannage ({unreadCount})
                    </div>
                    
                    {loading ? (
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    ) : demandes.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>
                            Aucune demande en attente
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {demandes.map(demande => (
                                <div key={demande.id} style={{ 
                                    padding: '15px', 
                                    borderBottom: '1px solid var(--border-color)',
                                    borderLeft: `3px solid #e94560`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <FontAwesomeIcon icon={faTruck} style={{ color: '#ff9800' }} />
                                        <strong>{demande.client_prenom} {demande.client_nom}</strong>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '10px' }}>
                                        📍 {demande.lat.toFixed(4)}, {demande.lng.toFixed(4)}<br/>
                                        📅 {new Date(demande.date_demande).toLocaleString()}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleAccepter(demande.id)}
                                            disabled={actionLoading === demande.id}
                                            style={{ 
                                                backgroundColor: '#4caf50', 
                                                padding: '6px 12px', 
                                                fontSize: '12px',
                                                flex: 1
                                            }}
                                        >
                                            {actionLoading === demande.id ? (
                                                <FontAwesomeIcon icon={faSpinner} spin />
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                                                    Accepter
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => handleRefuser(demande.id)}
                                            disabled={actionLoading === demande.id}
                                            style={{ 
                                                backgroundColor: '#f44336', 
                                                padding: '6px 12px', 
                                                fontSize: '12px',
                                                flex: 1
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminNotification;