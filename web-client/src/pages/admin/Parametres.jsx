import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faClock, faEuroSign, faWrench, faSave } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Parametres() {
    const [params, setParams] = useState({
        heure_ouverture: '08:00',
        heure_fermeture: '18:00',
        tarif_vidange: '',
        tarif_ct: '',
        tarif_reparation: ''
    });
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    const fetchParams = async () => {
        try {
            const [ouverture, fermeture] = await Promise.all([
                api.get('/configurations/heure_ouverture'),
                api.get('/configurations/heure_fermeture')
            ]);
            setParams({
                heure_ouverture: ouverture.data?.valeur || '08:00',
                heure_fermeture: fermeture.data?.valeur || '18:00',
                tarif_vidange: '',
                tarif_ct: '',
                tarif_reparation: ''
            });
        } catch (err) {
            console.error('Erreur:', err);
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
        try {
            await api.put('/configurations', { cle: 'heure_ouverture', valeur: params.heure_ouverture });
            await api.put('/configurations', { cle: 'heure_fermeture', valeur: params.heure_fermeture });
            setSuccess('Paramètres enregistrés avec succès');
            setTimeout(() => setSuccess(''), 3000);
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
                    <FontAwesomeIcon icon={faCog} style={{ marginRight: '10px' }} />
                    Paramètres
                </h1>

                {success && <p className="text-success text-center">{success}</p>}

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
                                Enregistrer
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h2>
                            <FontAwesomeIcon icon={faEuroSign} style={{ marginRight: '10px' }} />
                            Tarifs (à venir)
                        </h2>
                        <p className="text-light">Fonctionnalité à venir</p>
                    </div>

                    <div className="card">
                        <h2>
                            <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                            Services (à venir)
                        </h2>
                        <p className="text-light">Fonctionnalité à venir</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Parametres;