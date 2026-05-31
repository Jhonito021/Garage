// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faTachometerAlt, 
  faCalendarAlt, 
  faHistory, 
  faFileInvoice, 
  faSignOutAlt, 
  faUser, 
  faPlus, 
  faSignInAlt,
  faTruck,
  faMapMarkerAlt      // ← Déplacé ici en haut
} from '@fortawesome/free-solid-svg-icons';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const depanneur = JSON.parse(localStorage.getItem('depanneur') || '{}');
    const isLoggedIn = !!localStorage.getItem('user');
    const isDepanneurLoggedIn = !!localStorage.getItem('depanneur');
    
    // Ne pas afficher la navbar sur les pages admin, technicien ET dépanneur
    if (location.pathname.startsWith('/admin') || 
        location.pathname.startsWith('/technicien') ||
        location.pathname.startsWith('/depanneur')) {
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

    const handleDepanneurLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        } finally {
            localStorage.removeItem('depanneur');
            navigate('/');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                    TwentyOne Garage
                </Link>
            </div>
            
            {/* Si connecté en tant que dépanneur - afficher un menu spécifique */}
            {isDepanneurLoggedIn && !isLoggedIn && (
                <div className="navbar-links">
                    <Link to="/depanneur">
                        <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '5px' }} />
                        Tableau de bord
                    </Link>
                    <Link to="/depanneur/missions">
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} />
                        Missions
                    </Link>
                    <Link to="/depanneur/suivi">
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '5px' }} />
                        Suivi GPS
                    </Link>
                </div>
            )}
            
            {/* Si connecté en tant que client */}
            {isLoggedIn && !isDepanneurLoggedIn && (
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
                    <Link to="/factures">
                        <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '5px' }} />
                        Factures
                    </Link>
                    <Link to="/depannage" style={{ 
                        backgroundColor: '#e94560', 
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                    }}>
                        <FontAwesomeIcon icon={faTruck} style={{ marginRight: '5px' }} />
                        Dépannage 
                    </Link>
                </div>
            )}
            
            <div className="navbar-user">
                {/* Si connecté en tant que dépanneur */}
                {isDepanneurLoggedIn && !isLoggedIn && (
                    <>
                        <ThemeToggle />
                        <span style={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faTruck} />
                            {depanneur.prenom} {depanneur.nom}
                        </span>
                        <button onClick={handleDepanneurLogout} style={{ backgroundColor: '#f44336' }}>
                            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '5px' }} />
                            Déconnexion
                        </button>
                    </>
                )}
                
                {/* Si connecté en tant que client */}
                {isLoggedIn && !isDepanneurLoggedIn && (
                    <>
                        <ThemeToggle />
                        <Link to="/profil">
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                            {user.prenom} {user.nom}    
                        </Link>
                        <button onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '5px' }} />
                            Déconnexion
                        </button>
                    </>
                )}
                
                {/* Si non connecté */}
                {!isLoggedIn && !isDepanneurLoggedIn && (
                    <div className="flex gap-10">
                        <ThemeToggle />
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