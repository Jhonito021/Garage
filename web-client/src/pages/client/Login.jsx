import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Login() {
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
                // Stocker l'utilisateur dans localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                console.log('Utilisateur connecté:', response.data.user);
                
                // Rediriger vers le tableau de bord
                navigate('/dashboard');
            } else {
                setError('Erreur de connexion');
            }
        } catch (err) {
            console.error('Erreur login:', err);
            const errorMsg = err.response?.data?.error || 'Erreur de connexion au serveur';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-card">
                <h2 className="form-title">
                    <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px' }} />
                    Connexion
                </h2>
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
                            placeholder="client@test.com"
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
                            placeholder="123456"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-100">
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <p className="text-center mt-20">
                    Pas de compte ? <Link to="/register">S'inscrire</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;