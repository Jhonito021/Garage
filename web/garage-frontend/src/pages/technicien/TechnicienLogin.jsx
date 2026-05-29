import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faWrench, faEye, faEyeSlash, faArrowLeft, faToolbox } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function TechnicienLogin() {
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
                
                if (user.role === 'technicien') {
                    localStorage.setItem('user', JSON.stringify(user));
                    navigate('/technicien');
                } else if (user.role === 'admin') {
                    localStorage.setItem('user', JSON.stringify(user));
                    navigate('/admin');
                } else {
                    setError('Accès réservé aux techniciens et administrateurs');
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
                        width: '70px',
                        height: '70px',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <FontAwesomeIcon icon={faToolbox} size="2x" color="#ff9800" />
                    </div>
                    <h2 className="form-title" style={{ marginBottom: '5px' }}>Espace Technicien</h2>
                    <p className="text-light">Accès réservé aux mécaniciens</p>
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
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="technicien@garage.com"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
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
                        style={{ backgroundColor: '#ff9800' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Retour à l'accueil
                    </Link>
                </div>

                {/* <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <Link to="/admin/login" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        🔧 Espace administrateur
                    </Link>
                </div> */}
            </div>
        </div>
    );
}

export default TechnicienLogin;