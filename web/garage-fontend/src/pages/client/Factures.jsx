import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileInvoice, 
  faDownload, 
  faEuroSign, 
  faCalendarAlt, 
  faCheckCircle, 
  faHourglassHalf, 
  faCreditCard,
  faEye,
  faSyncAlt,
  faBoxes,
  faCar,
  faUser,
  faMapMarkerAlt,
  faEnvelope,
  faWrench
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Factures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(null);
  const [detailVisible, setDetailVisible] = useState(null);
  const [detailFacture, setDetailFacture] = useState(null);
  const [error, setError] = useState('');

  const fetchFactures = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/factures');
      console.log('Factures reçues:', res.data);
      setFactures(res.data);
      if (res.data.length === 0) {
        setError('Aucune facture trouvée');
      }
    } catch (err) {
      console.error('Erreur chargement factures:', err);
      setError('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handlePayer = async (id) => {
    setPayingId(id);
    setConfirmationVisible(null);
    
    try {
      await api.put(`/factures/${id}/payer`);
      setFactures(factures.map(f => 
        f.id === id ? { ...f, statut_paiement: 'payé' } : f
      ));
      alert('Facture payée avec succès');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors du paiement';
      alert(errorMsg);
    } finally {
      setPayingId(null);
    }
  };

  const openConfirmation = (id) => {
    setConfirmationVisible(id);
  };

  const closeConfirmation = () => {
    setConfirmationVisible(null);
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/factures/${id}`);
      console.log('Détail facture reçu:', res.data);
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

  const handleRefresh = () => {
    fetchFactures();
  };

  const formatMontant = (montant) => {
    const nombre = parseFloat(montant);
    if (isNaN(nombre)) return '0.00';
    return nombre.toFixed(2);
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de vos factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
        <h1>
          <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
          Mes factures
        </h1>
        <button onClick={handleRefresh} className="btn-outline">
          <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '5px' }} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="card text-center" style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: 'var(--danger)', marginBottom: '20px' }}>
          <p className="text-danger">{error}</p>
          <button onClick={handleRefresh} className="mt-10">Réessayer</button>
        </div>
      )}

      {!error && factures.length === 0 && (
        <div className="card text-center">
          <FontAwesomeIcon icon={faFileInvoice} style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '15px' }} />
          <p>Aucune facture disponible</p>
          <p className="text-light" style={{ fontSize: '14px' }}>
            Vos factures apparaîtront ici après vos interventions
          </p>
        </div>
      )}

      {factures.length > 0 && (
        <div className="mt-20">
          {factures.map(f => (
            <div key={f.id} className="card mb-20">
              <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                <div>
                  <h3>
                    <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
                    Facture #{f.id}
                  </h3>
                  <p>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                    Émise le {new Date(f.date_emission).toLocaleDateString('fr-FR')}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faEuroSign} style={{ marginRight: '8px' }} />
                    Montant: <strong>{formatMontant(f.montant_total)} €</strong>
                  </p>
                  <p>
                    Statut: 
                    <span className={`badge ${f.statut_paiement === 'payé' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>
                      {f.statut_paiement === 'payé' ? (
                        <><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Payée</>
                      ) : (
                        <><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />Impayée</>
                      )}
                    </span>
                  </p>
                  {f.marque && (
                    <p className="text-light" style={{ fontSize: '12px', marginTop: '5px' }}>
                      <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                      Intervention sur {f.marque} {f.modele} - {f.immatriculation}
                    </p>
                  )}
                </div>
                <div className="flex gap-10" style={{ marginTop: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn-accent" 
                    onClick={() => openDetail(f.id)}
                    style={{ padding: '8px 15px' }}
                  >
                    <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                    Détail
                  </button>
                  <button 
                    className="btn-accent" 
                    onClick={() => handleDownload(f.id)}
                    style={{ padding: '8px 15px' }}
                  >
                    <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
                    PDF
                  </button>
                  {f.statut_paiement !== 'payé' && (
                    <button 
                      onClick={() => openConfirmation(f.id)}
                      disabled={payingId === f.id}
                      style={{ padding: '8px 15px' }}
                    >
                      <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '5px' }} />
                      {payingId === f.id ? 'Paiement...' : 'Payer au garage'}
                    </button>
                  )}
                </div>
              </div>

              {/* Modal de confirmation de paiement */}
              {confirmationVisible === f.id && (
                <div className="modal-overlay" onClick={closeConfirmation}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Confirmation de paiement</h3>
                      <span className="modal-close" onClick={closeConfirmation}>&times;</span>
                    </div>
                    <div className="text-center">
                      <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: '3rem', color: 'var(--secondary-color)', marginBottom: '20px' }} />
                      <p>Confirmez-vous avoir payé la facture <strong>#{f.id}</strong> au garage ?</p>
                      <p className="text-light" style={{ fontSize: '14px', marginTop: '10px' }}>
                        Montant: <strong>{formatMontant(f.montant_total)} €</strong>
                      </p>
                      <div className="flex gap-10" style={{ justifyContent: 'center', marginTop: '20px' }}>
                        <button onClick={closeConfirmation} className="btn-outline">Annuler</button>
                        <button onClick={() => handlePayer(f.id)}>
                          Confirmer le paiement
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de détail de facture */}
              {detailVisible === f.id && detailFacture && (
                <div className="modal-overlay" onClick={closeDetail}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                    <div className="modal-header">
                      <h3>
                        <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
                        Détail de la facture
                      </h3>
                      <span className="modal-close" onClick={closeDetail}>&times;</span>
                    </div>
                    <div className="detail-facture">
                      {/* Informations générales */}
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

                      {/* Client */}
                      <div className="detail-section">
                        <h4>
                          <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                          Client
                        </h4>
                        <p><strong>Nom:</strong> {detailFacture.facture?.prenom || detailFacture.prenom} {detailFacture.facture?.nom || detailFacture.nom}</p>
                        <p><strong>Email:</strong> {detailFacture.facture?.email || detailFacture.email}</p>
                        <p><strong>Adresse:</strong> {detailFacture.facture?.adresse || detailFacture.adresse || 'Non renseignée'}</p>
                      </div>

                      <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                      {/* Véhicule */}
                      <div className="detail-section">
                        <h4>
                          <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                          Véhicule
                        </h4>
                        <p><strong>Marque:</strong> {detailFacture.facture?.marque || detailFacture.marque}</p>
                        <p><strong>Modèle:</strong> {detailFacture.facture?.modele || detailFacture.modele}</p>
                        <p><strong>Immatriculation:</strong> {detailFacture.facture?.immatriculation || detailFacture.immatriculation}</p>
                      </div>

                      <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                      {/* Intervention */}
                      <div className="detail-section">
                        <h4>
                          <FontAwesomeIcon icon={faWrench} style={{ marginRight: '8px' }} />
                          Intervention
                        </h4>
                        <p><strong>Intervention #{detailFacture.facture?.intervention_id || detailFacture.intervention_id}</strong></p>
                        <p><strong>Description:</strong> {detailFacture.facture?.description || detailFacture.description || 'Non renseignée'}</p>
                      </div>

                      <hr style={{ borderColor: '#333', margin: '15px 0' }} />

                      {/* Détail des coûts */}
                      <div className="detail-section">
                        <h4>Détail des coûts</h4>
                        <p><strong>Prestation:</strong> {formatMontant(detailFacture.prix_intervention)} €</p>
                        <p><strong>Pièces utilisées:</strong> {formatMontant(detailFacture.total_pieces)} €</p>
                        <hr />
                        <p><strong>Total:</strong> <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{formatMontant(detailFacture.montant_total)} €</span></p>
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
                                    <td>{formatMontant(p.prix_unitaire)} €</td>
                                    <td>{formatMontant(p.total)} €</td>
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
                        <button onClick={closeDetail}>Fermer</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Factures;