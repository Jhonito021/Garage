import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCar, faEnvelope, faPhone, faSearch, faEye } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/clients');
                setClients(res.data);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const fetchClientDetails = async (id) => {
        try {
            const res = await api.get(`/clients/${id}`);
            setSelectedClient(res.data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const filteredClients = clients.filter(c =>
        c.nom?.toLowerCase().includes(filter.toLowerCase()) ||
        c.prenom?.toLowerCase().includes(filter.toLowerCase()) ||
        c.email?.toLowerCase().includes(filter.toLowerCase())
    );

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
                        Clients
                    </h1>
                    <div style={{ width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                </div>

                {filteredClients.length === 0 ? (
                    <div className="card text-center mt-30">
                        <p>Aucun client trouvé</p>
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
                                    <th>Date d'inscription</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.nom}</td>
                                        <td>{c.prenom}</td>
                                        <td>{c.email}</td>
                                        <td>{c.telephone || '-'}</td>
                                        <td>{new Date(c.date_inscription).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <button 
                                                onClick={() => fetchClientDetails(c.id)} 
                                                className="btn-sm btn-accent"
                                                style={{ padding: '5px 10px' }}
                                            >
                                                <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal détails client */}
                {selectedClient && (
                    <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Détails du client</h3>
                                <span className="modal-close" onClick={() => setSelectedClient(null)}>&times;</span>
                            </div>
                            <div>
                                <p><strong>Nom :</strong> {selectedClient.client?.nom}</p>
                                <p><strong>Prénom :</strong> {selectedClient.client?.prenom}</p>
                                <p><strong>Email :</strong> {selectedClient.client?.email}</p>
                                <p><strong>Téléphone :</strong> {selectedClient.client?.telephone || '-'}</p>
                                <p><strong>Adresse :</strong> {selectedClient.client?.adresse || '-'}</p>
                                <p><strong>Date d'inscription :</strong> {new Date(selectedClient.client?.date_inscription).toLocaleDateString('fr-FR')}</p>
                                
                                <h4 style={{ marginTop: '20px' }}>
                                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                    Véhicules
                                </h4>
                                {selectedClient.vehicules?.length === 0 ? (
                                    <p>Aucun véhicule enregistré</p>
                                ) : (
                                    selectedClient.vehicules?.map(v => (
                                        <div key={v.id} className="card" style={{ marginTop: '10px', padding: '10px' }}>
                                            <p><strong>{v.marque} {v.modele}</strong></p>
                                            <p>Immatriculation: {v.immatriculation}</p>
                                            <p>Kilométrage: {v.kilometrage_actuel?.toLocaleString()} km</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Clients;