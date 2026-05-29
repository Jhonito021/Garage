// frontend/src/pages/depanneur/DepanneurLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faEnvelope, faLock, faSignInAlt, faEye, faEyeSlash, faArrowLeft, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function DepanneurLogin() {
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
                
                // Vérifier que l'utilisateur a le rôle technicien
                if (user.role === 'technicien') {
                    localStorage.setItem('depanneur', JSON.stringify(user));
                    navigate('/depanneur');
                } else {
                    setError('Accès réservé aux dépanneurs. Compte non autorisé.');
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
            <div className="form-card" style={{ maxWidth: '450px', width: '100%' }}>
                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <FontAwesomeIcon icon={faTruck} size="2x" color="#4caf50" />
                    </div>
                    <h2 style={{ marginBottom: '5px' }}>Espace Dépanneur</h2>
                    <p className="text-light">Connectez-vous à votre espace de travail</p>
                </div>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="depanneur@garage.com"
                            autoFocus
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
                                    cursor: 'pointer'
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
                        style={{ backgroundColor: '#4caf50', marginTop: '10px' }}
                    >
                        {loading ? 'Connexion...' : (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Retour à l'accueil
                    </Link>
                </div>

                <div style={{ marginTop: '15px', textAlign: 'center', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-light" style={{ fontSize: '12px' }}>
                        <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: '5px' }} />
                        Espace sécurisé - Accès réservé aux dépanneurs
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DepanneurLogin;