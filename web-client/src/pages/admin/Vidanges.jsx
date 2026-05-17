import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOilCan, faCog, faCalendarAlt, faCar, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Vidanges() {
    const [echeances, setEcheances] = useState([]);
    const [config, setConfig] = useState({
        intervalle_vidange_defaut: '8000',
        seuil_relance_vidange: '2000'
    });
    const [loading, setLoading] = useState(true);

    const fetchEcheances = async () => {
        try {
            const res = await api.get('/statistiques/echeances-vidange');
            setEcheances(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const fetchConfig = async () => {
        try {
            const [intervalle, seuil] = await Promise.all([
                api.get('/configurations/intervalle_vidange_defaut'),
                api.get('/configurations/seuil_relance_vidange')
            ]);
            setConfig({
                intervalle_vidange_defaut: intervalle.data?.valeur || '8000',
                seuil_relance_vidange: seuil.data?.valeur || '2000'
            });
        } catch (err) {
            console.error('Erreur config:', err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchEcheances(), fetchConfig()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleConfigChange = async (key, value) => {
        try {
            await api.put('/configurations', { cle: key, valeur: value });
            setConfig(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

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
                <h1>
                    <FontAwesomeIcon icon={faOilCan} style={{ marginRight: '10px' }} />
                    Suivi des vidanges
                </h1>

                <div className="grid-2" style={{ marginTop: '30px' }}>
                    <div className="card">
                        <h2>
                            <FontAwesomeIcon icon={faCog} style={{ marginRight: '10px' }} />
                            Configuration
                        </h2>
                        <div className="form-group">
                            <label>Intervalle vidange (km)</label>
                            <input
                                type="number"
                                value={config.intervalle_vidange_defaut}
                                onChange={(e) => handleConfigChange('intervalle_vidange_defaut', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Seuil de relance (km avant échéance)</label>
                            <input
                                type="number"
                                value={config.seuil_relance_vidange}
                                onChange={(e) => handleConfigChange('seuil_relance_vidange', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <h2>
                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                            Échéances à venir
                        </h2>
                        <p className="text-light">Clients dont la vidange est proche</p>
                    </div>
                </div>

                <div className="mt-30">
                    <h2>Clients à échéance</h2>
                    {echeances.length === 0 ? (
                        <div className="card text-center mt-20">
                            <p>Aucune échéance de vidange à venir</p>
                        </div>
                    ) : (
                        echeances.map(c => (
                            <div key={c.vehicule_id} className="card mb-20">
                                <div className="flex-between">
                                    <div>
                                        <h3>{c.prenom} {c.nom}</h3>
                                        <p>
                                            <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                            {c.marque} {c.modele} - {c.immatriculation}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px' }} />
                                            Kilométrage: {c.kilometrage_actuel?.toLocaleString()} km
                                        </p>
                                        <p>
                                            Dernière vidange: {c.dernier_km?.toLocaleString()} km
                                        </p>
                                        <p className="text-warning">
                                            Km parcourus depuis vidange: {c.km_parcourus?.toLocaleString()} km
                                        </p>
                                    </div>
                                    <div>
                                        <span className="badge badge-warning">
                                            Vidange bientôt due
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Vidanges;