// frontend/src/pages/client/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faCalendarCheck, 
  faBell, 
  faCreditCard, 
  faArrowRight, 
  faSignInAlt, 
  faTachometerAlt,
  faWrench,
  faUserCog,
  faToolbox,
  faPhone,
  faEnvelope,
  faFileInvoice,
  faTruck,           // NOUVEAU - Icône dépanneur
  faShieldAlt,       // NOUVEAU - Icône sécurité
  faHeadset,        // NOUVEAU - Icône support
  faMapMarkerAl,
  faRoute,
  faCheckCircle,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

// Importer les images locales
import bg1 from '../assets/images/bg1.png';
import bg2 from '../assets/images/bg2.png';
import bg3 from '../assets/images/bg3.png';
import bg4 from '../assets/images/bg4.png';
import bg5 from '../assets/images/bg5.png';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Liste des images de fond
  const backgroundImages = [bg1, bg2, bg3, bg4, bg5];

  // Changement d'image toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const features = [
    {
      icon: faCalendarCheck,
      title: "Rendez-vous en ligne",
      description: "Prenez rendez-vous 24h/24, 7j/7 en quelques clics",
      color: "#e94560",
      link: "/rdv"
    },
    {
      icon: faCar,
      title: "Gestion des véhicules",
      description: "Ajoutez et suivez tous vos véhicules",
      color: "#2196f3",
      link: "/vehicles"
    },
    {
      icon: faBell,
      title: "Rappels automatiques",
      description: "Recevez des notifications pour l'entretien",
      color: "#ff9800",
      link: "/dashboard"
    },
    {
      icon: faCreditCard,
      title: "Paiement en ligne",
      description: "Payez vos factures en toute sécurité",
      color: "#4caf50",
      link: "/factures"
    }
  ];

  if (isLoggedIn) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
            <FontAwesomeIcon icon={faCar} style={{ marginRight: '15px' }} />
            Garage Pro
          </h1>
          <p style={{ fontSize: '1.2rem', marginTop: '20px', color: 'var(--text-light)' }}>
            Bonjour {user?.prenom} {user?.nom}, bienvenue dans votre espace
          </p>
          <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard">
              <button style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
                <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '10px' }} />
                Accéder à mon tableau de bord
              </button>
            </Link>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: '40px' }}>
          <div className="card text-center">
            <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <h3>Prendre rendez-vous</h3>
            <p className="text-light">Réservez rapidement votre prochaine intervention</p>
            <Link to="/rdv">
              <button className="mt-20">Réserver</button>
            </Link>
          </div>
          <div className="card text-center">
            <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
              <FontAwesomeIcon icon={faCar} />
            </div>
            <h3>Mes véhicules</h3>
            <p className="text-light">Gérez votre flotte automobile</p>
            <Link to="/vehicles">
              <button className="mt-20">Voir mes véhicules</button>
            </Link>
          </div>
          <div className="card text-center">
            <div style={{ fontSize: '3rem', color: 'var(--secondary-color)' }}>
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
            <h3>Mes factures</h3>
            <p className="text-light">Consultez et payez vos factures</p>
            <Link to="/factures">
              <button className="mt-20">Voir mes factures</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section avec slider d'images */}
      <div style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImages[currentBgIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
        padding: '120px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <FontAwesomeIcon icon={faCar} size="4x" style={{ color: '#e94560', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Garage Pro
            </h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '30px', color: 'rgba(255,255,255,0.9)' }}>
              Gérez vos véhicules, prenez rendez-vous et suivez vos interventions en ligne
            </p>
            <div className="flex" style={{ justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link to="/register">
                <button style={{ fontSize: '1.1rem', padding: '14px 35px', boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)' }}>
                  Commencer <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }} />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-outline" style={{ fontSize: '1.1rem', padding: '14px 35px', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#fff' }}>
                  <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Indicateurs du slider */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBgIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                padding: 0,
                backgroundColor: currentBgIndex === index ? '#e94560' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* === NOUVEAU : BANNIÈRE ESPACE DÉPANNEUR === */}
      <div style={{ 
        backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(76, 175, 80, 0.05)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(76, 175, 80, 0.03)',
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Accès rapides - Espaces professionnels */}
      <div style={{ backgroundColor: 'var(--primary-color)', padding: '80px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>
            <FontAwesomeIcon icon={faUserCog} style={{ marginRight: '10px', color: 'var(--secondary-color)' }} />
            Espaces professionnels
          </h2>
          <div className="grid-3" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Espace Technicien */}
            <Link to="/technicien/login" style={{ textDecoration: 'none' }}>
              <div className="card text-center" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
                <div style={{ fontSize: '3rem', color: '#ff9800' }}>
                  <FontAwesomeIcon icon={faToolbox} />
                </div>
                <h3>Espace Technicien</h3>
                <p className="text-light">
                  Consultez vos interventions, pointez vos opérations et gérez votre travail
                </p>
                <button className="mt-20" style={{ backgroundColor: '#ff9800' }}>
                  Accéder
                  <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            </Link>

            {/* Espace Dépanneur - NOUVEAU */}
            <Link to="/depanneur/login" style={{ textDecoration: 'none' }}>
              <div className="card text-center" style={{ 
                height: '100%', 
                cursor: 'pointer', 
                transition: 'transform 0.3s ease',
                border: '2px solid rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ fontSize: '3rem', color: '#4caf50' }}>
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <h3>Espace Dépanneur</h3>
                <p className="text-light">
                  Gérez vos missions, suivez votre position en temps réel et optimisez vos trajets
                </p>
                <button className="mt-20" style={{ backgroundColor: '#4caf50' }}>
                  Accéder
                  <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            </Link>

            {/* Espace Administration */}
            <Link to="/admin/login" style={{ textDecoration: 'none' }}>
              <div className="card text-center" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
                <div style={{ fontSize: '3rem', color: '#e94560' }}>
                  <FontAwesomeIcon icon={faUserCog} />
                </div>
                <h3>Espace Administration</h3>
                <p className="text-light">
                  Gestion complète du garage, planning, stocks, factures et statistiques
                </p>
                <button className="mt-20">
                  Accéder
                  <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Une question ?</h2>
        <p className="text-light" style={{ marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
          Notre équipe est à votre disposition pour répondre à toutes vos questions.
        </p>
        <div className="flex" style={{ justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--secondary-color)', marginRight: '10px' }} />
            <span>038 51 014 00</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--secondary-color)', marginRight: '10px' }} />
            <span>jhonito021@gmail.com</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;