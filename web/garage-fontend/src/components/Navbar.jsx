import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTachometerAlt, faCalendarAlt, faHistory, faFileInvoice, faSignOutAlt, faUser, faPlus, faSignInAlt, faTruck } from '@fortawesome/free-solid-svg-icons';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!localStorage.getItem('user');
    
    // Ne pas afficher la navbar sur les pages admin ET technicien
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/technicien')) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        } finally {
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                    Garage Pro
                </Link>
            </div>
            {isLoggedIn && (
                <div className="navbar-links">
                    <Link to="/dashboard">
                        <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '5px' }} />
                        Tableau de bord
                    </Link>
                    <Link to="/vehicles">
                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                        Mes véhicules
                    </Link>
                    <Link to="/rdv">
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                        Rendez-vous
                    </Link>
                    <Link to="/suivi">
                        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '5px' }} />
                        Suivi
                    </Link>
                    {/* <Link to="/historique">
                        <FontAwesomeIcon icon={faHistory} style={{ marginRight: '5px' }} />
                        Historique
                    </Link> */}
                    <Link to="/factures">
                        <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '5px' }} />
                        Factures
                    </Link>
                    {/* NOUVEAU : Lien Dépannage d'urgence */}
                    <Link to="/depannage" style={{ 
                        backgroundColor: '#e94560', 
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                    }}>
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} />
                        Dépannage ⚡
                    </Link>
                    {/* <Link to="/profil">
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                        Mon profil
                    </Link> */}
                </div>
            )}
            <div className="navbar-user">
                {isLoggedIn ? (
                    <>
                        {/* <span>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                            {user.prenom} {user.nom}
                        </span> */}
                        <Link to="/profil">
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                            {user.prenom} {user.nom}    
                        </Link>
                        
                        <button onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '5px' }} />
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <div className="flex gap-10">
                        <Link to="/login">
                            <button className="btn-outline">
                                <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '5px' }} />
                                Connexion
                            </button>
                        </Link>
                        <Link to="/register">
                            <button>
                                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
                                Inscription
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;