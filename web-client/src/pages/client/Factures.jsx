import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faDownload, faEuroSign, faCalendarAlt, faCheckCircle, faHourglassHalf, faCar } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

function Factures() {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const res = await api.get('/factures');
                setFactures(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFactures();
    }, []);

    const handleDownload = async (id) => {
        try {
            const response = await api.get(`/factures/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erreur lors du téléchargement');
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>
                <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '10px' }} />
                Mes factures
            </h1>

            <div className="mt-30">
                {factures.length === 0 ? (
                    <div className="card text-center">
                        <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--text-light)' }}>
                            <FontAwesomeIcon icon={faFileInvoice} />
                        </div>
                        <p>Aucune facture disponible</p>
                    </div>
                ) : (
                    factures.map(f => (
                        <div key={f.id} className="card mb-20">
                            <div className="flex-between">
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
                                        Montant: {f.montant_total?.toFixed(2)} €
                                    </p>
                                    <p>
                                        <FontAwesomeIcon icon={faCar} style={{ marginRight: '8px' }} />
                                        Véhicule: {f.marque} {f.modele} - {f.immatriculation}
                                    </p>
                                    <p>
                                        Statut: 
                                        <span className={`badge ${f.statut_paiement === 'payé' ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: '8px' }}>
                                            {f.statut_paiement === 'payé' ? <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px' }} /> : <FontAwesomeIcon icon={faHourglassHalf} style={{ marginRight: '5px' }} />}
                                            {f.statut_paiement === 'payé' ? 'Payée' : 'Impayée'}
                                        </span>
                                    </p>
                                </div>
                                {f.pdf_url && (
                                    <button onClick={() => handleDownload(f.id)} className="btn-accent">
                                        <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
                                        Télécharger PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Factures;