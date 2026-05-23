import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faEdit, 
  faSave, 
  faTimes,
  faKey,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  });
  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setFormData({
        nom: res.data.nom || '',
        prenom: res.data.prenom || '',
        telephone: res.data.telephone || '',
        adresse: res.data.adresse || ''
      });
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/update', formData);
      setSuccess('Profil mis à jour avec succès');
      setEditing(false);
      fetchProfil();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.nouveau_mot_de_passe !== passwordData.confirmation) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.nouveau_mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        ancien_mot_de_passe: passwordData.ancien_mot_de_passe,
        nouveau_mot_de_passe: passwordData.nouveau_mot_de_passe
      });
      setSuccess('Mot de passe modifié avec succès');
      setShowPasswordForm(false);
      setPasswordData({
        ancien_mot_de_passe: '',
        nouveau_mot_de_passe: '',
        confirmation: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
        <h1>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
          Mon profil
        </h1>
        {!editing && !showPasswordForm && (
          <div className="flex gap-10">
            <button onClick={() => setEditing(true)} className="btn-outline">
              <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
              Modifier mon profil
            </button>
            <button onClick={() => setShowPasswordForm(true)} className="btn-outline">
              <FontAwesomeIcon icon={faKey} style={{ marginRight: '5px' }} />
              Changer mot de passe
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="card text-center" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: 'var(--danger)', marginBottom: '20px' }}>
          <p className="text-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="card text-center" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'var(--success)', marginBottom: '20px' }}>
          <p className="text-success">{success}</p>
        </div>
      )}

      {/* Formulaire de modification du profil */}
      {editing && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2>Modifier mon profil</h2>
            <button onClick={() => setEditing(false)} className="btn-accent">
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
              Annuler
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
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
                placeholder="0612345678"
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
                rows="3"
                placeholder="Votre adresse complète"
              />
            </div>
            <div className="flex gap-10">
              <button type="submit">
                <FontAwesomeIcon icon={faSave} style={{ marginRight: '5px' }} />
                Enregistrer
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulaire de changement de mot de passe */}
      {showPasswordForm && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2>Changer mon mot de passe</h2>
            <button onClick={() => setShowPasswordForm(false)} className="btn-accent">
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
              Annuler
            </button>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input
                type="password"
                name="ancien_mot_de_passe"
                value={passwordData.ancien_mot_de_passe}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                name="nouveau_mot_de_passe"
                value={passwordData.nouveau_mot_de_passe}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirmation"
                value={passwordData.confirmation}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="flex gap-10">
              <button type="submit">
                <FontAwesomeIcon icon={faSave} style={{ marginRight: '5px' }} />
                Changer le mot de passe
              </button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="btn-outline">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Affichage du profil */}
      {!editing && !showPasswordForm && (
        <div className="card">
          <div className="profil-info">
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Email
              </div>
              <div className="info-value">{user?.email}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Nom complet
              </div>
              <div className="info-value">{user?.prenom} {user?.nom}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Téléphone
              </div>
              <div className="info-value">{user?.telephone || 'Non renseigné'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Adresse
              </div>
              <div className="info-value">{user?.adresse || 'Non renseignée'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Type de compte
              </div>
              <div className="info-value">
                <span className="badge badge-info">
                  {user?.role === 'client' ? 'Client' : user?.role === 'technicien' ? 'Technicien' : 'Administrateur'}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">
                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                Statut
              </div>
              <div className="info-value">
                <span className="badge badge-success">Compte actif</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profil;