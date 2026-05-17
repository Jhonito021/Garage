import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../services/api';
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

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            // Appeler la route logout du backend
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        } finally {
            // Supprimer l'utilisateur du localStorage
            localStorage.removeItem('user');
            // Rediriger vers la page d'accueil
            navigate('/');
        }
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

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

export default Sidebar;