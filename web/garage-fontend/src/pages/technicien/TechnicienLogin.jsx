import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faWrench } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function TechnicienLogin() {
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

            console.log('Réponse login:', response.data);

            if (response.data.user) {
                // Vérifier que le rôle est technicien
                if (response.data.user.role === 'technicien') {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    navigate('/technicien');
                } else {
                    setError('Accès réservé aux techniciens. Compte non autorisé.');
                }
            } else {
                setError('Erreur de connexion');
            }
        } catch (err) {
            console.error('Erreur:', err);
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
                    <h2 className="form-title">Espace Technicien</h2>
                    <p className="text-light">Connexion réservée aux techniciens</p>
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
                            placeholder=""
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
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-100">
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/admin/login" className="text-light">
                        ← Accès administration
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default TechnicienLogin;