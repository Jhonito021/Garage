import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTachometerAlt, faCalendarAlt, faHistory, faFileInvoice, faSignOutAlt, faUser, faPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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
                    <Link to="/historique">
                        <FontAwesomeIcon icon={faHistory} style={{ marginRight: '5px' }} />
                        Historique
                    </Link>
                    <Link to="/factures">
                        <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '5px' }} />
                        Factures
                    </Link>
                </div>
            )}
            <div className="navbar-user">
                {isLoggedIn ? (
                    <>
                        <span>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                            {user.prenom} {user.nom}
                        </span>
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