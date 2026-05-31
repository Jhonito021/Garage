// frontend/src/pages/client/Profil.jsx
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
  faCheckCircle,
  faCar,
  faHistory,
  faFileInvoice,
  faCalendarAlt,
  faShieldAlt,
  faUserCheck,
  faIdCard,
  faCrown,
  faToolbox,
  faTruck,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [stats, setStats] = useState({
    vehicules: 0,
    interventions: 0,
    factures: 0,
    rdv: 0
  });
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
  const [showPassword, setShowPassword] = useState({
    ancien: false,
    nouveau: false,
    confirmation: false
  });

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
      
      // Récupérer les statistiques
      const [vehiculesRes, interventionsRes, facturesRes, rdvRes] = await Promise.all([
        api.get('/vehicules'),
        api.get('/suivi/interventions'),
        api.get('/factures'),
        api.get('/rdv')
      ]);
      
      setStats({
        vehicules: vehiculesRes.data?.length || 0,
        interventions: interventionsRes.data?.length || 0,
        factures: facturesRes.data?.length || 0,
        rdv: rdvRes.data?.length || 0
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
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
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

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'admin': return faCrown;
      case 'technicien': return faToolbox;
      case 'depanneur': return faTruck;
      default: return faUser;
    }
  };

  const getRoleColor = () => {
    switch(user?.role) {
      case 'admin': return '#e94560';
      case 'technicien': return '#ff9800';
      case 'depanneur': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const getRoleLabel = () => {
    switch(user?.role) {
      case 'admin': return 'Administrateur';
      case 'technicien': return 'Technicien';
      case 'depanneur': return 'Dépanneur';
      default: return 'Client';
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
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--secondary-color)', marginBottom: '5px' }}>
          <FontAwesomeIcon icon={faUser} style={{ marginRight: '15px' }} />
          Mon profil
        </h1>
        <p className="text-light">Gérez vos informations personnelles et votre compte</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="card" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: '#f44336', marginBottom: '20px' }}>
          <p className="text-danger" style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="card" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4caf50', marginBottom: '20px' }}>
          <p className="text-success" style={{ margin: 0 }}>{success}</p>
        </div>
      )}

      <div className="grid-2" style={{ gap: '30px' }}>
        {/* Section gauche - Carte de profil */}
        <div>
          <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              backgroundColor: `rgba(${getRoleColor() === '#e94560' ? '233, 69, 96' : getRoleColor() === '#ff9800' ? '255, 152, 0' : getRoleColor() === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.05)`,
              borderRadius: '50%'
            }}></div>
            
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: `rgba(${getRoleColor() === '#e94560' ? '233, 69, 96' : getRoleColor() === '#ff9800' ? '255, 152, 0' : getRoleColor() === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.1)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FontAwesomeIcon icon={getRoleIcon()} size="3x" color={getRoleColor()} />
            </div>
            
            <h2 style={{ marginBottom: '5px' }}>{user?.prenom} {user?.nom}</h2>
            <p style={{ color: getRoleColor(), marginBottom: '15px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', backgroundColor: `rgba(${getRoleColor() === '#e94560' ? '233, 69, 96' : getRoleColor() === '#ff9800' ? '255, 152, 0' : getRoleColor() === '#4caf50' ? '76, 175, 80' : '33, 150, 243'}, 0.1)` }}>
              <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '5px' }} />
              {getRoleLabel()}
            </p>
            
            <p className="text-light" style={{ marginBottom: '20px' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
              {user?.email}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {!editing && !showPasswordForm && (
                <>
                  <button onClick={() => setEditing(true)} className="btn-outline">
                    <FontAwesomeIcon icon={faEdit} style={{ marginRight: '8px' }} />
                    Modifier le profil
                  </button>
                  <button onClick={() => setShowPasswordForm(true)} className="btn-outline">
                    <FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} />
                    Changer mot de passe
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="card" style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--secondary-color)' }}>
              <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '10px' }} />
              Mes statistiques
            </h3>
            <div className="grid-2" style={{ gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '10px' }}>
                <FontAwesomeIcon icon={faCar} size="2x" color="#e94560" />
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{stats.vehicules}</div>
                <div className="text-light" style={{ fontSize: '12px' }}>Véhicules</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '10px' }}>
                <FontAwesomeIcon icon={faHistory} size="2x" color="#ff9800" />
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{stats.interventions}</div>
                <div className="text-light" style={{ fontSize: '12px' }}>Interventions</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '10px' }}>
                <FontAwesomeIcon icon={faFileInvoice} size="2x" color="#4caf50" />
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{stats.factures}</div>
                <div className="text-light" style={{ fontSize: '12px' }}>Factures</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '10px' }}>
                <FontAwesomeIcon icon={faCalendarAlt} size="2x" color="#2196f3" />
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{stats.rdv}</div>
                <div className="text-light" style={{ fontSize: '12px' }}>Rendez-vous</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaires */}
        <div>
          {/* Formulaire de modification du profil */}
          {editing && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>
                  <FontAwesomeIcon icon={faEdit} style={{ marginRight: '10px' }} />
                  Modifier mon profil
                </h3>
                <button onClick={() => setEditing(false)} className="btn-accent" style={{ padding: '5px 12px' }}>
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
                    placeholder="Votre nom"
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
                    placeholder="Votre prénom"
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
                    placeholder="06 12 34 56 78"
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
                
                <button type="submit" style={{ width: '100%' }}>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

          {/* Formulaire de changement de mot de passe */}
          {showPasswordForm && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '10px' }} />
                  Changer mon mot de passe
                </h3>
                <button onClick={() => setShowPasswordForm(false)} className="btn-accent" style={{ padding: '5px 12px' }}>
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: '5px' }} />
                  Annuler
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Ancien mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword.ancien ? 'text' : 'password'}
                      name="ancien_mot_de_passe"
                      value={passwordData.ancien_mot_de_passe}
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('ancien')}
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
                      <FontAwesomeIcon icon={showPassword.ancien ? 'eye-slash' : 'eye'} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword.nouveau ? 'text' : 'password'}
                      name="nouveau_mot_de_passe"
                      value={passwordData.nouveau_mot_de_passe}
                      onChange={handlePasswordChange}
                      required
                      placeholder="•••••• (min. 6 caractères)"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('nouveau')}
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
                      <FontAwesomeIcon icon={showPassword.nouveau ? 'eye-slash' : 'eye'} />
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Confirmer le nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword.confirmation ? 'text' : 'password'}
                      name="confirmation"
                      value={passwordData.confirmation}
                      onChange={handlePasswordChange}
                      required
                      placeholder="••••••"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmation')}
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
                      <FontAwesomeIcon icon={showPassword.confirmation ? 'eye-slash' : 'eye'} />
                    </button>
                  </div>
                </div>
                
                <button type="submit" style={{ width: '100%', backgroundColor: '#ff9800' }}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} />
                  Changer le mot de passe
                </button>
              </form>
            </div>
          )}

          {/* Affichage du profil (non édition) */}
          {!editing && !showPasswordForm && (
            <div className="card">
              <h3 style={{ marginBottom: '20px', color: 'var(--secondary-color)' }}>
                <FontAwesomeIcon icon={faIdCard} style={{ marginRight: '10px' }} />
                Informations personnelles
              </h3>
              
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
                    <FontAwesomeIcon icon={faUserCheck} style={{ marginRight: '8px', color: 'var(--secondary-color)' }} />
                    Type de compte
                  </div>
                  <div className="info-value">
                    <span className="badge badge-info" style={{ backgroundColor: getRoleColor() }}>
                      {getRoleLabel()}
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
      </div>

      <style>{`
        .info-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          padding: 12px 0;
          transition: all 0.3s ease;
        }
        
        .info-row:hover {
          background-color: rgba(233, 69, 96, 0.05);
          padding-left: 10px;
        }
        
        .info-label {
          width: 150px;
          font-weight: 600;
          color: var(--text-light);
        }
        
        .info-value {
          flex: 1;
          color: var(--text-color);
        }
        
        @media (max-width: 768px) {
          .info-row {
            flex-direction: column;
            gap: 8px;
          }
          
          .info-label {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Profil;