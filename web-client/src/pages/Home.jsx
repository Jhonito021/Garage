import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faWrench, faUser, faArrowRight, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

function Home() {
    const isLoggedIn = !!localStorage.getItem('user');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Si déjà connecté, rediriger vers son espace
    if (isLoggedIn) {
        if (user.role === 'admin') {
            window.location.href = '/admin';
        } else if (user.role === 'technicien') {
            window.location.href = '/technicien';
        } else {
            window.location.href = '/dashboard';
        }
        return null;
    }

    return (
        <div className="container">
            <div className="hero">
                <h1 className="hero-title">
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '15px' }} />
                    Garage Pro
                </h1>
                <p className="hero-subtitle">
                    Gérez vos véhicules, prenez rendez-vous et suivez vos interventions en ligne
                </p>
            </div>

            <div className="grid-3" style={{ marginTop: '60px' }}>
                {/* Carte Client */}
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <h3>Espace Client</h3>
                    <p className="text-light">
                        Gérez vos véhicules, prenez rendez-vous et suivez vos réparations
                    </p>
                <Link to="/login">
                        <button style={{ marginTop: '20px' }}>
                            <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                            Se connecter
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="btn-outline" style={{ marginTop: '10px' }}>
                            Créer un compte
                        </button>
                    </Link>
                </div>

                {/* Carte Technicien */}
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faWrench} />
                    </div>
                    <h3>Espace Technicien</h3>
                    <p className="text-light">
                        Consultez vos interventions, pointez vos opérations
                    </p>
                    <Link to="technicien/login">
                        <button style={{ marginTop: '20px' }}>
                            <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                            Accès technicien
                        </button>
                    </Link>
                </div>

                {/* Carte Admin */}
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faCar} />
                    </div>
                    <h3>Espace Garage</h3>
                    <p className="text-light">
                        Gestion complète du garage, planning, stocks, factures
                    </p>
                    <Link to="/admin/login">
                        <button style={{ marginTop: '20px' }}>
                            <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                            Accès administration
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;