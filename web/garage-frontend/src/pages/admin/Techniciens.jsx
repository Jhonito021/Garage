// frontend/src/pages/admin/Techniciens.jsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus, 
  faEdit, 
  faTrash, 
  faTimes, 
  faEnvelope, 
  faPhone, 
  faWrench,
  faCheck,
  faUserCog,
  faTruck
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Techniciens() {
  const [techniciens, setTechniciens] = useState([]);
  const [depanneurs, setDepanneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('technicien'); // 'technicien' ou 'depanneur'
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
    nom: '',
    prenom: '',
    telephone: '',
    specialite: '',
    actif: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTechniciens = async () => {
    try {
        const res = await api.get('/utilisateurs?role=technicien');
        console.log('Techniciens reçus:', res.data);
        setTechniciens(res.data);
        
        const resDep = await api.get('/utilisateurs?role=depanneur');
        console.log('Dépanneurs reçus:', resDep.data);
        setDepanneurs(resDep.data);
    } catch (err) {
        console.error('Erreur:', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechniciens();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.nom || !formData.prenom) {
      setError('Email, nom et prénom sont requis');
      return;
    }

    try {
      if (editingId) {
        // Modification
        await api.put(`/utilisateurs/${editingId}`, {
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          specialite: formData.specialite,
          actif: formData.actif
        });
        setSuccess('Utilisateur modifié avec succès');
      } else {
        // Création
        if (!formData.mot_de_passe) {
          setError('Mot de passe requis pour un nouvel utilisateur');
          return;
        }
        
        // Ajouter le rôle sélectionné
        const userData = {
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          specialite: formData.specialite,
          role: selectedRole,
          actif: true
        };
        
        await api.post('/utilisateurs', userData);
        setSuccess(`${selectedRole === 'technicien' ? 'Technicien' : 'Dépanneur'} ajouté avec succès`);
      }
      
      setModalVisible(false);
      setEditingId(null);
      setFormData({
        email: '',
        mot_de_passe: '',
        nom: '',
        prenom: '',
        telephone: '',
        specialite: '',
        actif: true
      });
      fetchTechniciens();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        api.delete(`/utilisateurs/${id}`);
        setSuccess('Utilisateur supprimé');
        fetchTechniciens();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      mot_de_passe: '',
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone || '',
      specialite: user.specialite || '',
      actif: user.actif === 1
    });
    setEditingId(user.id);
    setSelectedRole(user.role);
    setModalVisible(true);
  };

  const getSpecialiteBadge = (specialite) => {
    if (!specialite) return <span className="badge badge-info">Non spécifié</span>;
    return <span className="badge badge-info">{specialite}</span>;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <div className="flex-between">
          <h1>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />
            Gestion des techniciens et dépanneurs
          </h1>
          <button onClick={() => {
            setEditingId(null);
            setSelectedRole('technicien');
            setFormData({
              email: '',
              mot_de_passe: '',
              nom: '',
              prenom: '',
              telephone: '',
              specialite: '',
              actif: true
            });
            setModalVisible(true);
          }}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
            Ajouter un utilisateur
          </button>
        </div>

        {error && <p className="text-danger text-center" style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px', margin: '10px 0' }}>{error}</p>}
        {success && <p className="text-success text-center" style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '5px', margin: '10px 0' }}>{success}</p>}

        {/* Section Techniciens */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>
            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
            Techniciens ({techniciens.length})
          </h2>
          <div className="mt-20">
            {techniciens.length === 0 ? (
              <p className="text-center">Aucun technicien enregistré</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Spécialité</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {techniciens.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.nom}</td>
                      <td>{t.prenom}</td>
                      <td>{t.email}</td>
                      <td>{t.telephone || '-'}</td>
                      <td>{getSpecialiteBadge(t.specialite)}</td>
                      <td>
                        <span className={t.actif === 1 ? 'badge badge-success' : 'badge badge-danger'}>
                          {t.actif === 1 ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-10">
                          <button onClick={() => handleEdit(t)} className="btn-accent" style={{ padding: '5px 10px' }}>
                            <FontAwesomeIcon icon={faEdit} /> Modifier
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="btn-accent" style={{ padding: '5px 10px', backgroundColor: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTrash} /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section Dépanneurs */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>
            <FontAwesomeIcon icon={faTruck} style={{ marginRight: '10px' }} />
            Dépanneurs ({depanneurs.length})
          </h2>
          <div className="mt-20">
            {depanneurs.length === 0 ? (
              <p className="text-center">Aucun dépanneur enregistré</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depanneurs.map(d => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.nom}</td>
                      <td>{d.prenom}</td>
                      <td>{d.email}</td>
                      <td>{d.telephone || '-'}</td>
                      <td>
                        <span className={d.actif === 1 ? 'badge badge-success' : 'badge badge-danger'}>
                          {d.actif === 1 ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-10">
                          <button onClick={() => handleEdit(d)} className="btn-accent" style={{ padding: '5px 10px' }}>
                            <FontAwesomeIcon icon={faEdit} /> Modifier
                          </button>
                          <button onClick={() => handleDelete(d.id)} className="btn-accent" style={{ padding: '5px 10px', backgroundColor: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTrash} /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Ajout/Modification */}
        {modalVisible && (
          <div className="modal-overlay" onClick={() => setModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FontAwesomeIcon icon={faUserCog} style={{ marginRight: '10px' }} />
                  {editingId ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                </h3>
                <span className="modal-close" onClick={() => setModalVisible(false)}>&times;</span>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Sélection du rôle (uniquement pour création) */}
                {!editingId && (
                  <div className="form-group">
                    <label>Rôle *</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          value="technicien"
                          checked={selectedRole === 'technicien'}
                          onChange={() => setSelectedRole('technicien')}
                        />
                        <FontAwesomeIcon icon={faWrench} /> Technicien
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          value="depanneur"
                          checked={selectedRole === 'depanneur'}
                          onChange={() => setSelectedRole('depanneur')}
                        />
                        <FontAwesomeIcon icon={faTruck} /> Dépanneur
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                    placeholder="email@garage.com"
                  />
                </div>
                
                {!editingId && (
                  <div className="form-group">
                    <label>Mot de passe *</label>
                    <input
                      type="password"
                      name="mot_de_passe"
                      value={formData.mot_de_passe}
                      onChange={handleChange}
                      required
                      placeholder="••••••"
                    />
                    <small className="text-light">Minimum 6 caractères</small>
                  </div>
                )}
                
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="0612345678"
                  />
                </div>
                
                {selectedRole === 'technicien' && (
                  <div className="form-group">
                    <label>Spécialité</label>
                    <select name="specialite" value={formData.specialite} onChange={handleChange}>
                      <option value="">Sélectionner une spécialité</option>
                      <option value="Mécanique générale">Mécanique générale</option>
                      <option value="Moteur">Moteur</option>
                      <option value="Carrosserie">Carrosserie</option>
                      <option value="Électricité">Électricité</option>
                      <option value="Climatisation">Climatisation</option>
                      <option value="Pneumatiques">Pneumatiques</option>
                      <option value="Diagnostic">Diagnostic</option>
                    </select>
                  </div>
                )}
                
                {editingId && (
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="actif"
                        checked={formData.actif}
                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      />
                      {' '}Utilisateur actif
                    </label>
                  </div>
                )}
                
                <button type="submit">
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                  {editingId ? 'Mettre à jour' : `Ajouter ${selectedRole === 'technicien' ? 'le technicien' : 'le dépanneur'}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Techniciens;