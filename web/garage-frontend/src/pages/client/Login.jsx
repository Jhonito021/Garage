import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faCar, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { isElectron, isAllowedInElectron } from '../../utils/isElectron';

function Login() {
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

                // Restriction Electron : admin uniquement
                if (!isAllowedInElectron(user)) {
                    setError("L'application desktop est réservée aux administrateurs.");
                    return;
                }

                localStorage.setItem('user', JSON.stringify(user));

                // Redirection selon le rôle
                if (user.role === 'admin' || user.role === 'technicien') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
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
        <div className="form-container">
            <div className="form-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FontAwesomeIcon icon={faCar} size="3x" color="#e94560" />
                    <h2 className="form-title" style={{ marginTop: '15px' }}>Connexion</h2>
                    <p className="text-light">Accédez à votre espace client</p>
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
                            placeholder="votre@email.com"
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
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
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

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <p className="text-light">
                        Pas de compte ? <Link to="/register" style={{ fontWeight: 'bold' }}>Créer un compte</Link>
                    </p>
                    {/* <div style={{ marginTop: '15px' }}>
                        <Link to="/admin/login" style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                            🔧 Accès technicien / administrateur
                        </Link>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default Login;