import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faEnvelope, 
  faLock, 
  faUser, 
  faPhone, 
  faMapMarkerAlt,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: '',
        confirm_password: '',
        nom: '',
        prenom: '',
        telephone: '',
        adresse: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Validation du mot de passe
    const passwordValid = formData.mot_de_passe.length >= 6;
    const passwordMatch = formData.mot_de_passe === formData.confirm_password;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email || !formData.mot_de_passe || !formData.nom || !formData.prenom) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!emailValid) {
            setError('Email invalide');
            return;
        }

        if (formData.mot_de_passe.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (formData.mot_de_passe !== formData.confirm_password) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            const { confirm_password, ...submitData } = formData;
            await api.post('/auth/register', submitData);
            setSuccess('Compte créé avec succès ! Redirection...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ maxWidth: '650px' }}>
            <div className="form-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FontAwesomeIcon icon={faUserPlus} size="3x" color="#e94560" />
                    <h2 className="form-title" style={{ marginTop: '15px' }}>Inscription</h2>
                    <p className="text-light">Créez votre compte client</p>
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

                {success && (
                    <div style={{ 
                        backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                        border: '1px solid #4caf50',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p className="text-success" style={{ margin: 0 }}>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ gap: '20px' }}>
                        <div className="form-group">
                            <label>
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                Nom *
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                placeholder="Nom"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                Prénom *
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                placeholder="Prénom"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
                            Email *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="votre@email.com"
                                style={{ paddingRight: '40px' }}
                            />
                            {formData.email && (
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    {emailValid ? 
                                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#4caf50' }} /> : 
                                        <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#f44336' }} />
                                    }
                                </span>
                            )}
                        </div>
                        {formData.email && !emailValid && (
                            <small className="text-danger">Format d'email invalide</small>
                        )}
                    </div>

                    <div className="grid-2" style={{ gap: '20px' }}>
                        <div className="form-group">
                            <label>
                                <FontAwesomeIcon icon={faLock} style={{ marginRight: '8px' }} />
                                Mot de passe *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="mot_de_passe"
                                    value={formData.mot_de_passe}
                                    onChange={handleChange}
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
                            {formData.mot_de_passe && (
                                <small style={{ color: passwordValid ? '#4caf50' : '#f44336' }}>
                                    {passwordValid ? '✓ Mot de passe valide' : '✗ Minimum 6 caractères'}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Confirmer le mot de passe *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {formData.confirm_password && (
                                <small style={{ color: passwordMatch ? '#4caf50' : '#f44336' }}>
                                    {passwordMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            placeholder="0380123456"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px' }} />
                            Adresse
                        </label>
                        <textarea
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Votre adresse complète"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-100"
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? 'Inscription en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <p className="text-light">
                        Déjà un compte ? <Link to="/login" style={{ fontWeight: 'bold' }}>Se connecter</Link>
                    </p>
                    <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'inline-block', marginTop: '10px' }}>
                        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;