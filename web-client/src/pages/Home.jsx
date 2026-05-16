import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCalendarCheck, faBell, faCreditCard, faArrowRight, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

function Home() {
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
                <div className="hero-buttons">
                    <Link to="/register">
                        <button>
                            Commencer <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }} />
                        </button>
                    </Link>
                    <Link to="/login">
                        <button className="btn-outline">
                            <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                            Se connecter
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid-4">
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faCalendarCheck} />
                    </div>
                    <h3>Rendez-vous en ligne</h3>
                    <p className="text-light">Prenez rendez-vous facilement 24h/24</p>
                </div>
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faCar} />
                    </div>
                    <h3>Gestion des véhicules</h3>
                    <p className="text-light">Ajoutez et suivez tous vos véhicules</p>
                </div>
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faBell} />
                    </div>
                    <h3>Rappels vidange</h3>
                    <p className="text-light">Recevez des notifications automatiques</p>
                </div>
                <div className="card text-center">
                    <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
                        <FontAwesomeIcon icon={faCreditCard} />
                    </div>
                    <h3>Paiement en ligne</h3>
                    <p className="text-light">Payez vos factures en toute sécurité</p>
                </div>
            </div>
        </div>
    );
}

export default Home;