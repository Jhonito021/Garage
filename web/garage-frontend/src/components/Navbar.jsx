import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faTachometerAlt,
  faCalendarAlt,
  faFileInvoice,
  faSignOutAlt,
  faUser,
  faPlus,
  faSignInAlt,
  faTruck,
  faMapMarkerAlt,
  faBars,
  faTimes,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const depanneur = JSON.parse(localStorage.getItem('depanneur') || '{}');
    const isLoggedIn = !!localStorage.getItem('user');
    const isDepanneurLoggedIn = !!localStorage.getItem('depanneur');

    if (
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/technicien') ||
        location.pathname.startsWith('/depanneur')
    ) {
        return null;
    }

    const close = () => setMenuOpen(false);

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('user');
        close();
        navigate('/');
    };

    const handleDepanneurLogout = async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('depanneur');
        close();
        navigate('/');
    };

    return (
        <nav className="navbar">

            {/* ── Ligne haute : toujours visible ── */}
            <div className="navbar-top-row">
                <div className="navbar-brand">
                    <Link to="/" onClick={close}>
                        <FontAwesomeIcon icon={faCar} />
                        TwentyOne Garage
                    </Link>
                </div>

                <div className="navbar-controls">
                    <ThemeToggle />
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
                    </button>
                </div>
            </div>

            {/* ── Menu collapsible ── */}
            <div className={`navbar-collapse${menuOpen ? ' open' : ''}`}>

                {/* Liens dépanneur */}
                {isDepanneurLoggedIn && !isLoggedIn && (
                    <div className="navbar-links">
                        <Link to="/depanneur" onClick={close}>
                            <FontAwesomeIcon icon={faTachometerAlt} /> Tableau de bord
                        </Link>
                        <Link to="/depanneur/missions" onClick={close}>
                            <FontAwesomeIcon icon={faTruck} /> Missions
                        </Link>
                        <Link to="/depanneur/suivi" onClick={close}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> Suivi GPS
                        </Link>
                    </div>
                )}

                {/* Liens client */}
                {isLoggedIn && !isDepanneurLoggedIn && (
                    <div className="navbar-links">
                        <Link to="/dashboard" onClick={close}>
                            <FontAwesomeIcon icon={faTachometerAlt} /> Tableau de bord
                        </Link>
                        <Link to="/vehicles" onClick={close}>
                            <FontAwesomeIcon icon={faCar} /> Mes véhicules
                        </Link>
                        <Link to="/rdv" onClick={close}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Rendez-vous
                        </Link>
                        <Link to="/suivi" onClick={close}>
                            <FontAwesomeIcon icon={faChartLine} /> Suivi
                        </Link>
                        <Link to="/factures" onClick={close}>
                            <FontAwesomeIcon icon={faFileInvoice} /> Factures
                        </Link>
                        <Link to="/depannage" onClick={close} className="navbar-link-depannage">
                            <FontAwesomeIcon icon={faTruck} /> Dépannage
                        </Link>
                    </div>
                )}

                {/* Actions utilisateur */}
                <div className="navbar-user">
                    {isDepanneurLoggedIn && !isLoggedIn && (
                        <>
                            <span className="navbar-username">
                                <FontAwesomeIcon icon={faTruck} />
                                {depanneur.prenom} {depanneur.nom}
                            </span>
                            <button className="btn-danger" onClick={handleDepanneurLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
                            </button>
                        </>
                    )}

                    {isLoggedIn && !isDepanneurLoggedIn && (
                        <>
                            <Link to="/profil" onClick={close} className="navbar-username">
                                <FontAwesomeIcon icon={faUser} />
                                {user.prenom} {user.nom}
                            </Link>
                            <button onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
                            </button>
                        </>
                    )}

                    {!isLoggedIn && !isDepanneurLoggedIn && (
                        <>
                            <Link to="/login" onClick={close}>
                                <button className="btn-outline">
                                    <FontAwesomeIcon icon={faSignInAlt} /> Connexion
                                </button>
                            </Link>
                            <Link to="/register" onClick={close}>
                                <button>
                                    <FontAwesomeIcon icon={faPlus} /> Inscription
                                </button>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Navbar;
