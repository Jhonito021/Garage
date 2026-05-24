import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWrench, 
  faCar, 
  faUser, 
  faCalendarAlt, 
  faSearch, 
  faEye,
  faTag,
  faCheckCircle,
  faClock,
  faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Interventions() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchInterventions = async () => {
            try {
                const res = await api.get('/interventions/all');
                console.log('Interventions reçues:', res.data);
                setInterventions(res.data);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterventions();
    }, []);

    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'terminée':
                return <span className="badge badge-success"><FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} />Terminée</span>;
            case 'en_cours':
                return <span className="badge badge-warning"><FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />En cours</span>;
            case 'prévue':
                return <span className="badge badge-info"><FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />Prévue</span>;
            default:
                return <span className="badge badge-info">{statut}</span>;
        }
    };

    const getTypePrestationBadge = (type) => {
        const colors = {
            'Vidange': 'badge-info',
            'Contrôle technique': 'badge-warning',
            'Réparation': 'badge-danger',
            'Entretien courant': 'badge-success',
            'Pneumatiques': 'badge-info'
        };
        return <span className={`badge ${colors[type] || 'badge-info'}`}>{type || 'Intervention'}</span>;
    };

    const filteredInterventions = interventions.filter(i =>
        i.immatriculation?.toLowerCase().includes(filter.toLowerCase()) ||
        i.marque?.toLowerCase().includes(filter.toLowerCase()) ||
        i.client_nom?.toLowerCase().includes(filter.toLowerCase()) ||
        i.technicien_nom?.toLowerCase().includes(filter.toLowerCase()) ||
        i.type_prestation?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                    <div className="loading">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
                <div className="flex-between">
                    <h1>
                        <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                        Suivi des interventions
                    </h1>
                    <div style={{ width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Rechercher par véhicule, client, technicien ou prestation..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                </div>

                {filteredInterventions.length === 0 ? (
                    <div className="card text-center mt-30">
                        <p>Aucune intervention trouvée</p>
                    </div>
                ) : (
                    <div className="mt-30">
                        {filteredInterventions.map(i => (
                            <div key={i.id} className="card mb-20">
                                <div className="flex-between" style={{ flexWrap: 'wrap' }}>
                                    <div>
                                        <div className="flex gap-10" style={{ alignItems: 'center', marginBottom: '10px' }}>
                                            <h3 style={{ margin: 0 }}>
                                                <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                                                Intervention #{i.id}
                                            </h3>
                                            {getTypePrestationBadge(i.type_prestation)}
                                        </div>
                                        <p>
                                            <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                            {i.marque} {i.modele} - {i.immatriculation}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                            Client: {i.client_prenom} {i.client_nom}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                            Technicien: {i.technicien_prenom} {i.technicien_nom || 'Non assigné'}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
                                            {i.date_debut ? new Date(i.date_debut).toLocaleString('fr-FR') : 'Non démarrée'}
                                            {i.date_fin && ` → ${new Date(i.date_fin).toLocaleString('fr-FR')}`}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faTag} style={{ marginRight: '8px' }} />
                                            Prestation: <strong>{i.type_prestation || i.description || 'Non spécifié'}</strong>
                                        </p>
                                        {i.duree_totale && (
                                            <p className="text-light">Durée: {i.duree_totale} minutes</p>
                                        )}
                                        <p style={{ marginTop: '10px' }}>
                                            Statut: {getStatusBadge(i.statut)}
                                        </p>
                                    </div>
                                    <div>
                                        <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                            <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                                            Lecture seule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Interventions;