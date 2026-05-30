import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileInvoice, 
  faPlus, 
  faEdit, 
  faTrash, 
  faEuroSign,
  faCheckCircle,
  faHourglassHalf,
  faEye,
  faDownload,
  faPrint,
  faBoxes,
  faSyncAlt,
  faCar
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function FacturesGestion() {
  const [factures, setFactures] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(null);
  const [detailFacture, setDetailFacture] = useState(null);
  const [formData, setFormData] = useState({
    intervention_id: '',
    montant_total: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFactures = async () => {
    try {
      const res = await api.get('/factures');
      setFactures(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const fetchInterventions = async () => {
    try {
      const res = await api.get('/interventions/all');
      // Filtrer les interventions terminées sans facture
      const factureIds = factures.map(f => f.intervention_id);
      const terminees = res.data.filter(i => i.statut === 'terminée' && !factureIds.includes(i.id));
      setInterventions(terminees);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFactures();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchInterventions();
    }
  }, [factures, loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/factures/${editingId}`, formData);
        setSuccess('Facture modifiée avec succès');
      } else {
        await api.post('/factures', { intervention_id: formData.intervention_id });
        setSuccess('Facture créée avec succès');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ intervention_id: '', montant_total: '' });
      await fetchFactures();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette facture ?')) {
      try {
        await api.delete(`/factures/${id}`);
        await fetchFactures();
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur');
      }
    }
  };

  const handleEdit = (facture) => {
    setFormData({
      intervention_id: facture.intervention_id,
      montant_total: facture.montant_total
    });
    setEditingId(facture.id);
    setShowForm(true);
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/factures/${id}`);
      setDetailFacture(res.data);
      setDetailVisible(id);
    } catch (err) {
      console.error('Erreur chargement détail:', err);
      alert('Erreur lors du chargement du détail');
    }
  };

  const closeDetail = () => {
    setDetailVisible(null);
    setDetailFacture(null);
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/factures/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  const handlePrint = async (id) => {
    try {
      const response = await api.get(`/factures/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const printWindow = window.open(url, '_blank');
      printWindow.print();
    } catch (err) {
      alert('Erreur lors de l\'impression');
    }
  };

  const formatMontant = (montant) => {
    const nombre = parseFloat(montant);
    if (isNaN(nombre)) return '0.00';
    return nombre.toFixed(2);
  };

  const handleRefresh = () => {
    fetchFactures();
    fetchInterventions();
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
            <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
            Gestion des factures
          </h1>
          <div className="flex gap-10">
            <button onClick={handleRefresh} className="btn-outline">
              <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
              Actualiser
            </button>
            <button onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ intervention_id: '', montant_total: '' });
            }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} />
              {showForm ? 'Annuler' : 'Créer une facture'}
            </button>
          </div>
        </div>

        {error && <p className="text-danger text-center">{error}</p>}
        {success && <p className="text-success text-center">{success}</p>}

        {/* Formulaire de création */}
        {showForm && (
          <div className="card mt-20">
            <h3>{editingId ? 'Modifier la facture' : 'Nouvelle facture'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Intervention terminée</label>
                <select
                  name="intervention_id"
                  value={formData.intervention_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une intervention</option>
                  {interventions.map(i => (
                    <option key={i.id} value={i.id}>
                      #{i.id} - {i.marque} {i.modele} - {i.immatriculation}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit">Créer la facture</button>
            </form>
          </div>
        )}

        {/* Liste des factures */}
        {factures.length === 0 ? (
          <div className="card text-center mt-30">
            <FontAwesomeIcon icon={faFileInvoice} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
            <p>Aucune facture</p>
            <p className="text-light">Créez une facture à partir d'une intervention terminée</p>
          </div>
        ) : (
          <div className="mt-30">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Intervention</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {factures.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>Intervention #{f.intervention_id}</td>
                    <td>{new Date(f.date_emission).toLocaleDateString('fr-FR')}</td>
                    <td>{formatMontant(f.montant_total)} Ar</td>
                    <td>
                      <span className={`badge ${f.statut_paiement === 'payé' ? 'badge-success' : 'badge-danger'}`}>
                        {f.statut_paiement === 'payé' ? 'Payée' : 'Impayée'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-10">
                        <button onClick={() => openDetail(f.id)} className="btn-accent" title="Voir détails">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button onClick={() => handleDownload(f.id)} className="btn-accent" title="Télécharger PDF">
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button onClick={() => handlePrint(f.id)} className="btn-accent" title="Imprimer">
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                        <button onClick={() => handleDelete(f.id)} className="btn-accent" title="Supprimer">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de détail de facture */}
        {detailVisible && detailFacture && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="modal-header">
                <h3>
                  <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
                  Détail de la facture #{detailFacture.facture?.id || detailFacture.id}
                </h3>
                <span className="modal-close" onClick={closeDetail}>&times;</span>
              </div>
              <div className="detail-facture">
                <div className="detail-section">
                  <h4>Informations générales</h4>
                  <p><strong>Numéro:</strong> {detailFacture.facture?.id || detailFacture.id}</p>
                  <p><strong>Date d'émission:</strong> {new Date(detailFacture.facture?.date_emission || detailFacture.date_emission).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Statut:</strong> 
                    <span className={`badge ${(detailFacture.facture?.statut_paiement || detailFacture.statut_paiement) === 'payé' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>
                      {(detailFacture.facture?.statut_paiement || detailFacture.statut_paiement) === 'payé' ? 'Payée' : 'Impayée'}
                    </span>
                  </p>
                </div>

                <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                <div className="detail-section">
                  <h4>Client</h4>
                  <p><strong>Nom:</strong> {detailFacture.facture?.prenom || detailFacture.prenom} {detailFacture.facture?.nom || detailFacture.nom}</p>
                  <p><strong>Email:</strong> {detailFacture.facture?.email || detailFacture.email}</p>
                  <p><strong>Adresse:</strong> {detailFacture.facture?.adresse || detailFacture.adresse || 'Non renseignée'}</p>
                </div>

                <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                <div className="detail-section">
                  <h4>Véhicule</h4>
                  <p><strong>Marque:</strong> {detailFacture.facture?.marque || detailFacture.marque}</p>
                  <p><strong>Modèle:</strong> {detailFacture.facture?.modele || detailFacture.modele}</p>
                  <p><strong>Immatriculation:</strong> {detailFacture.facture?.immatriculation || detailFacture.immatriculation}</p>
                </div>

                <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                <div className="detail-section">
                  <h4>Intervention</h4>
                  <p><strong>Intervention #{detailFacture.facture?.intervention_id || detailFacture.intervention_id}</strong></p>
                  <p><strong>Description:</strong> {detailFacture.facture?.description || detailFacture.description || 'Non renseignée'}</p>
                </div>

                <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                <div className="detail-section">
                  <h4>Détail des coûts</h4>
                  <p><strong>Prestation:</strong> {formatMontant(detailFacture.prix_intervention)} Ar</p>
                  <p><strong>Pièces utilisées:</strong> {formatMontant(detailFacture.total_pieces)} Ar</p>
                  <hr />
                  <p><strong>Total:</strong> <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{formatMontant(detailFacture.montant_total)} Ar</span></p>
                </div>

                {/* Liste des pièces utilisées */}
                {detailFacture.pieces && detailFacture.pieces.length > 0 && (
                  <>
                    <hr style={{ borderColor: '#333', margin: '15px 0' }} />
                    <div className="detail-section">
                      <h4>
                        <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '10px' }} />
                        Pièces utilisées
                      </h4>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Référence</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailFacture.pieces.map((p, idx) => (
                            <tr key={idx}>
                              <td>{p.nom}</td>
                              <td>{p.reference}</td>
                              <td>{p.quantite_utilisee}</td>
                              <td>{p.prix_unitaire} Ar</td>
                              <td>{p.total} Ar</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                  <button onClick={() => handleDownload(detailFacture.facture?.id || detailFacture.id)}>
                    <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
                    Télécharger PDF
                  </button>
                  <button onClick={() => handlePrint(detailFacture.facture?.id || detailFacture.id)}>
                    <FontAwesomeIcon icon={faPrint} style={{ marginRight: '5px' }} />
                    Imprimer
                  </button>
                  <button onClick={closeDetail}>Fermer</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacturesGestion;