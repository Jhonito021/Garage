// frontend/src/components/DepanneurSidebar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, 
    faTruck, 
    faMapMarkerAlt, 
    faHistory, 
    faUser, 
    faSignOutAlt,
    faCheckCircle,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function DepanneurSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const depanneur = JSON.parse(localStorage.getItem('depanneur') || '{}');

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        } finally {
            localStorage.removeItem('depanneur');
            navigate('/depanneur/login');
        }
    };

    return (
        <div className="admin-sidebar" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
            <div className="admin-sidebar-header">
                <h2 style={{ color: '#4caf50' }}>
                    <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
                    Espace Dépanneur
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '5px' }}>
                    {depanneur.prenom} {depanneur.nom}
                </p>
            </div>
            
            <nav className="admin-sidebar-nav">
                <Link to="/depanneur" className={isActive('/depanneur')}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Tableau de bord</span>
                </Link>
                <Link to="/depanneur/missions" className={isActive('/depanneur/missions')}>
                    <FontAwesomeIcon icon={faTruck} />
                    <span>Missions</span>
                </Link>
                <Link to="/depanneur/suivi" className={isActive('/depanneur/suivi')}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>Suivi GPS</span>
                </Link>
                <Link to="/depanneur/historique" className={isActive('/depanneur/historique')}>
                    <FontAwesomeIcon icon={faHistory} />
                    <span>Historique</span>
                </Link>
                <Link to="/depanneur/profil" className={isActive('/depanneur/profil')}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Mon profil</span>
                </Link>
            </nav>
            
            <div className="admin-sidebar-footer">
                <button onClick={handleLogout} style={{ backgroundColor: '#f44336' }}>
                    <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '10px' }} />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}

export default DepanneurSidebar;