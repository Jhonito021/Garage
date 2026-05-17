import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faWrench } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Rediriger selon le rôle
                if (response.data.user.role === 'admin' || response.data.user.role === 'technicien') {
                    navigate('/admin');
                } else {
                    setError('Accès non autorisé. Compte client uniquement.');
                    localStorage.removeItem('user');
                }
            } else {
                setError('Erreur de connexion');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            backgroundColor: 'var(--bg-color)'
        }}>
            <div className="form-card" style={{ width: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <FontAwesomeIcon icon={faWrench} style={{ fontSize: '3rem', color: 'var(--secondary-color)' }} />
                    <h2 className="form-title">Espace Garage</h2>
                    <p className="text-light">Connexion administrateur / technicien</p>
                </div>
                
                {error && <p className="text-danger text-center">{error}</p>}
                
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
                            placeholder="admin@garage.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} />
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="admin123"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-100">
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;