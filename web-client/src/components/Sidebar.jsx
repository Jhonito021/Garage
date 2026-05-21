import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, 
    faCalendarAlt, 
    faWrench, 
    faBoxes, 
    faFileInvoice, 
    faUsers, 
    faOilCan, 
    faCog,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    const isTechnicien = user.role === 'technicien';

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        } finally {
            localStorage.removeItem('user');
            if (isTechnicien) {
                navigate('/');
            } else {
                navigate('/');
            }
        }
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // Si c'est un technicien, afficher le menu technicien
    if (isTechnicien) {
        return (
            <div className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Espace Technicien
                    </h2>
                </div>
                
                <nav className="admin-sidebar-nav">
                    <Link to="/technicien" className={isActive('/technicien')}>
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        <span>Tableau de bord</span>
                    </Link>
                    <Link to="/technicien/interventions" className={isActive('/technicien/interventions')}>
                        <FontAwesomeIcon icon={faWrench} />
                        <span>Mes interventions</span>
                    </Link>
                </nav>
                
                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '10px' }} />
                        Déconnexion
                    </button>
                </div>
            </div>
        );
    }

    // Si c'est un admin, afficher le menu admin complet
    if (isAdmin) {
        return (
            <div className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Garage Admin
                    </h2>
                </div>
                
                <nav className="admin-sidebar-nav">
                    <Link to="/admin" className={isActive('/admin')}>
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        <span>Tableau de bord</span>
                    </Link>
                    <Link to="/admin/planning" className={isActive('/admin/planning')}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Planning</span>
                    </Link>
                    <Link to="/admin/interventions" className={isActive('/admin/interventions')}>
                        <FontAwesomeIcon icon={faWrench} />
                        <span>Interventions</span>
                    </Link>
                    <Link to="/admin/stocks" className={isActive('/admin/stocks')}>
                        <FontAwesomeIcon icon={faBoxes} />
                        <span>Stocks</span>
                    </Link>
                    <Link to="/admin/devis" className={isActive('/admin/devis')}>
                        <FontAwesomeIcon icon={faFileInvoice} />
                        <span>Devis</span>
                    </Link>
                    <Link to="/admin/factures" className={isActive('/admin/factures')}>
                        <FontAwesomeIcon icon={faFileInvoice} />
                        <span>Factures</span>
                    </Link>
                    <Link to="/admin/clients" className={isActive('/admin/clients')}>
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Clients</span>
                    </Link>
                    <Link to="/admin/techniciens" className={isActive('/admin/techniciens')}>
                        <FontAwesomeIcon icon={faUsers} />
                        <span>Techniciens</span>
                    </Link>
                    <Link to="/admin/vidanges" className={isActive('/admin/vidanges')}>
                        <FontAwesomeIcon icon={faOilCan} />
                        <span>Vidanges</span>
                    </Link>
                    <Link to="/admin/parametres" className={isActive('/admin/parametres')}>
                        <FontAwesomeIcon icon={faCog} />
                        <span>Paramètres</span>
                    </Link>
                </nav>
                
                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '10px' }} />
                    </button>
                </div>
            </div>
        );
    }

    // Redirection si aucun rôle valide
    return null;
}

export default Sidebar;