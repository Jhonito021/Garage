import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faWrench, faEye, faEyeSlash, faArrowLeft, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                mot_de_passe: password
            });

            if (response.data.user) {
                const user = response.data.user;
                
                // Vérifier le rôle
                if (user.role === 'admin' || user.role === 'technicien') {
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Redirection selon le rôle
                    if (user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/technicien');
                    }
                } else {
                    setError('Accès non autorisé. Cette page est réservée aux administrateurs et techniciens.');
                }
            } else {
                setError('Email ou mot de passe incorrect');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-color)',
            padding: '20px'
        }}>
            <div className="form-card" style={{ maxWidth: '450px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                {/* Badge décoratif */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    backgroundColor: 'rgba(233, 69, 96, 0.1)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '100px',
                    height: '100px',
                    backgroundColor: 'rgba(233, 69, 96, 0.05)',
                    borderRadius: '50%'
                }}></div>

                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: 'rgba(233, 69, 96, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <FontAwesomeIcon icon={faWrench} size="2x" color="#e94560" />
                    </div>
                    <h2 className="form-title" style={{ marginBottom: '5px' }}>Espace Professionnel</h2>
                    <p className="text-light">Accès réservé aux techniciens et administrateurs</p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div style={{ 
                        backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                        border: '1px solid #f44336',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p className="text-danger" style={{ margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
                            Email professionnel
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="garage@gmail.com"
                            autoFocus
                            style={{ transition: 'all 0.3s ease' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} />
                            Mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#aaaaaa',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-100"
                        style={{ 
                            marginTop: '10px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {loading ? (
                            <span>Connexion en cours...</span>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                {/* Informations complémentaires */}
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faShieldAlt} size="12px" color="#4caf50" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Accès sécurisé</span>
                        </div>
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faWrench} size="12px" color="#ff9800" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Espace technicien</span>
                        </div>
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faShieldAlt} size="12px" color="#e94560" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Espace admin</span>
                        </div>
                    </div>
                </div>

                {/* Liens de navigation */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Retour à l'accueil
                    </Link>
                </div>

                {/* <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Espace client
                    </Link>
                    <span style={{ margin: '0 10px', color: 'var(--border-color)' }}>|</span>
                    <Link to="/register" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        Créer un compte client
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default AdminLogin;