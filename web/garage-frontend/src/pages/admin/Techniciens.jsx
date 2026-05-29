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
  faUserCog
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Techniciens() {
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
        setSuccess('Technicien modifié avec succès');
      } else {
        // Création
        if (!formData.mot_de_passe) {
          setError('Mot de passe requis pour un nouveau technicien');
          return;
        }
        await api.post('/utilisateurs', {
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          specialite: formData.specialite,
          role: 'technicien',
          actif: true
        });
        setSuccess('Technicien ajouté avec succès');
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
    if (window.confirm('Supprimer ce technicien ?')) {
      try {
        api.delete(`/utilisateurs/${id}`);
        setSuccess('Technicien supprimé');
        fetchTechniciens();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = (technicien) => {
    setFormData({
      email: technicien.email,
      mot_de_passe: '',
      nom: technicien.nom,
      prenom: technicien.prenom,
      telephone: technicien.telephone || '',
      specialite: technicien.specialite || '',
      actif: technicien.actif === 1
    });
    setEditingId(technicien.id);
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
            Gestion des techniciens
          </h1>
          <button onClick={() => {
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
            setModalVisible(true);
          }}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
            Ajouter un technicien
          </button>
        </div>

        {error && <p className="text-danger text-center" style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px', margin: '10px 0' }}>{error}</p>}
        {success && <p className="text-success text-center" style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '5px', margin: '10px 0' }}>{success}</p>}

        {techniciens.length === 0 ? (
          <div className="card text-center mt-30">
            <FontAwesomeIcon icon={faUsers} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
            <p>Aucun technicien enregistré</p>
            <button onClick={() => setModalVisible(true)} className="mt-20">Ajouter votre premier technicien</button>
          </div>
        ) : (
          <div className="mt-30">
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
                          <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} />
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="btn-accent" style={{ padding: '5px 10px', backgroundColor: 'var(--danger)' }}>
                          <FontAwesomeIcon icon={faTrash} style={{ marginRight: '5px' }} />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Ajout/Modification */}
        {modalVisible && (
          <div className="modal-overlay" onClick={() => setModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FontAwesomeIcon icon={faUserCog} style={{ marginRight: '10px' }} />
                  {editingId ? 'Modifier le technicien' : 'Ajouter un technicien'}
                </h3>
                <span className="modal-close" onClick={() => setModalVisible(false)}>&times;</span>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                    placeholder="technicien@garage.com"
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
                
                {editingId && (
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="actif"
                        checked={formData.actif}
                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      />
                      {' '}Technicien actif
                    </label>
                  </div>
                )}
                
                <button type="submit">
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: '5px' }} />
                  {editingId ? 'Mettre à jour' : 'Ajouter le technicien'}
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