import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faClock, faEuroSign, faWrench, faSave, faOilCan, faCar, faWrench as faWrenchIcon } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Parametres() {
  const [params, setParams] = useState({
    heure_ouverture: '08:00',
    heure_fermeture: '18:00',
    tarif_vidange: '50.00',
    tarif_ct: '65.00',
    tarif_reparation: '80.00',
    tarif_entretien: '45.00',
    tarif_pneumatiques: '35.00'
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchParams = async () => {
    try {
      const keys = [
        'heure_ouverture', 'heure_fermeture',
        'tarif_vidange', 'tarif_ct', 'tarif_reparation', 'tarif_entretien', 'tarif_pneumatiques'
      ];
      
      const results = await Promise.all(
        keys.map(key => api.get(`/configurations/${key}`).catch(() => ({ data: { valeur: '' } })))
      );
      
      const newParams = {};
      keys.forEach((key, index) => {
        newParams[key] = results[index].data?.valeur || '';
      });
      
      setParams(newParams);
    } catch (err) {
      console.error('Erreur fetchParams:', err);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParams();
  }, []);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updates = Object.entries(params).map(([key, value]) =>
        api.put('/configurations', { cle: key, valeur: value })
      );
      await Promise.all(updates);
      setSuccess('Paramètres enregistrés avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur handleSubmit:', err);
      setError('Erreur lors de l\'enregistrement des paramètres');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getTarifByService = (service) => {
    const tarifs = {
      'Vidange': params.tarif_vidange,
      'Contrôle technique': params.tarif_ct,
      'Réparation': params.tarif_reparation,
      'Entretien courant': params.tarif_entretien,
      'Pneumatiques': params.tarif_pneumatiques
    };
    return tarifs[service] || '0.00';
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
        <h1>
          <FontAwesomeIcon icon={faCog} style={{ marginRight: '10px' }} />
          Paramètres
        </h1>

        {error && <p className="text-danger text-center" style={{ padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '5px' }}>{error}</p>}
        {success && <p className="text-success text-center" style={{ padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '5px' }}>{success}</p>}

        <div className="grid-2" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: '10px' }} />
              Horaires d'ouverture
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Heure d'ouverture</label>
                <input
                  type="time"
                  name="heure_ouverture"
                  value={params.heure_ouverture}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Heure de fermeture</label>
                <input
                  type="time"
                  name="heure_fermeture"
                  value={params.heure_fermeture}
                  onChange={handleChange}
                />
              </div>
              <button type="submit">
                <FontAwesomeIcon icon={faSave} style={{ marginRight: '5px' }} />
                Enregistrer les horaires
              </button>
            </form>
          </div>

          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faEuroSign} style={{ marginRight: '10px' }} />
              Tarifs par défaut
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '5px' }} />
                  Vidange
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarif_vidange"
                  value={params.tarif_vidange}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                  Contrôle technique
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarif_ct"
                  value={params.tarif_ct}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faWrenchIcon} style={{ marginRight: '5px' }} />
                  Réparation
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarif_reparation"
                  value={params.tarif_reparation}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faWrench} style={{ marginRight: '5px' }} />
                  Entretien courant
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarif_entretien"
                  value={params.tarif_entretien}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                  Pneumatiques
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarif_pneumatiques"
                  value={params.tarif_pneumatiques}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <button type="submit">
                <FontAwesomeIcon icon={faSave} style={{ marginRight: '5px' }} />
                Enregistrer les tarifs
              </button>
            </form>
          </div>
        </div>

        <div className="card mt-20">
          <h2>Tarifs appliqués</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Prestation</th>
                <th>Tarif par défaut</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Vidange</td><td>{getTarifByService('Vidange')} Ar</td></tr>
              <tr><td>Contrôle technique</td><td>{getTarifByService('Contrôle technique')} Ar</td></tr>
              <tr><td>Réparation</td><td>{getTarifByService('Réparation')} Ar</td></tr>
              <tr><td>Entretien courant</td><td>{getTarifByService('Entretien courant')} Ar</td></tr>
              <tr><td>Pneumatiques</td><td>{getTarifByService('Pneumatiques')} Ar</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Parametres;