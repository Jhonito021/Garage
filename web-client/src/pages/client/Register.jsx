import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone, faMapMarkerAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: '',
        nom: '',
        prenom: '',
        telephone: '',
        adresse: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            setSuccess('Compte créé avec succès ! Redirection...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-card">
                <h2 className="form-title">
                    <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '10px' }} />
                    Inscription
                </h2>
                {error && <p className="text-danger text-center">{error}</p>}
                {success && <p className="text-success text-center">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
                            Email *
                        </label>
                        <input type="email" name="email" placeholder="votre@email.com" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} />
                            Mot de passe *
                        </label>
                        <input type="password" name="mot_de_passe" placeholder="••••••" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                            Nom *
                        </label>
                        <input type="text" name="nom" placeholder="Dupont" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                            Prénom *
                        </label>
                        <input type="text" name="prenom" placeholder="Jean" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />
                            Téléphone
                        </label>
                        <input type="tel" name="telephone" placeholder="0612345678" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px' }} />
                            Adresse
                        </label>
                        <textarea name="adresse" placeholder="10 Rue de Paris, 75001 Paris" rows="2" onChange={handleChange} />
                    </div>
                    <button type="submit" disabled={loading} className="w-100">
                        {loading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>
                <p className="text-center mt-20">
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;