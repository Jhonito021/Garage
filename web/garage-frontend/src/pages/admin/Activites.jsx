import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, 
  faCar, 
  faWrench, 
  faFileInvoice, 
  faUser, 
  faCalendarAlt, 
  faFilter,
  faSearch,
  faDownload,
  faEye,
  faClock,
  faUserPlus,
  faTrash,
  faEdit,
  faEuroSign
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function Activites() {
  const [activites, setActivites] = useState([]);
  const [filteredActivites, setFilteredActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const [interventionsRes, rdvsRes, facturesRes, clientsRes, vehiculesRes] = await Promise.all([
          api.get('/interventions/all'),
          api.get('/rdv'),
          api.get('/factures'),
          api.get('/utilisateurs?role=client'),
          api.get('/vehicules')
        ]);

        const activitesList = [];

        interventionsRes.data.forEach(i => {
          activitesList.push({
            id: `intervention-${i.id}`,
            type: 'intervention',
            action: i.statut === 'terminée' ? 'Intervention terminée' : (i.statut === 'en_cours' ? 'Intervention démarrée' : 'Intervention créée'),
            description: `${i.description || 'Intervention'} sur ${i.marque} ${i.modele}`,
            date: i.date_debut || i.created_at || new Date(),
            icon: faWrench,
            color: i.statut === 'terminée' ? '#4caf50' : (i.statut === 'en_cours' ? '#ff9800' : '#2196f3'),
            lien: `/admin/interventions`,
            badgeColor: '#2196f3'
          });
        });

        rdvsRes.data.forEach(r => {
          activitesList.push({
            id: `rdv-${r.id}`,
            type: 'rdv',
            action: r.statut === 'annulé' ? 'Rendez-vous annulé' : 'Rendez-vous confirmé',
            description: `${r.service_demande} pour ${r.marque} ${r.modele}`,
            date: r.date_heure,
            icon: faCalendarAlt,
            color: r.statut === 'annulé' ? '#f44336' : '#4caf50',
            lien: `/admin/planning`,
            badgeColor: '#ff9800'
          });
        });

        facturesRes.data.forEach(f => {
          activitesList.push({
            id: `facture-${f.id}`,
            type: 'facture',
            action: f.statut_paiement === 'payé' ? 'Facture payée' : 'Facture créée',
            description: `Facture #${f.id} - Montant: ${f.montant_total}Ar`,
            date: f.date_emission,
            icon: faFileInvoice,
            color: f.statut_paiement === 'payé' ? '#4caf50' : '#ff9800',
            lien: `/admin/factures`,
            badgeColor: '#4caf50'
          });
        });

        clientsRes.data.forEach(c => {
          activitesList.push({
            id: `client-${c.id}`,
            type: 'client',
            action: 'Nouveau client inscrit',
            description: `${c.prenom} ${c.nom} - ${c.email}`,
            date: c.date_inscription,
            icon: faUserPlus,
            color: '#2196f3',
            lien: `/admin/clients`,
            badgeColor: '#2196f3'
          });
        });

        vehiculesRes.data.forEach(v => {
          activitesList.push({
            id: `vehicule-${v.id}`,
            type: 'vehicule',
            action: 'Nouveau véhicule ajouté',
            description: `${v.marque} ${v.modele} - ${v.immatriculation}`,
            date: v.created_at,
            icon: faCar,
            color: '#e94560',
            lien: `/admin/clients`,
            badgeColor: '#9c27b0'
          });
        });

        activitesList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivites(activitesList);
        setFilteredActivites(activitesList);
      } catch (err) {
        console.error('Erreur chargement activités:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivites();
  }, []);

  useEffect(() => {
    let result = [...activites];

    if (filter !== 'all') {
      result = result.filter(a => a.type === filter);
    }

    if (searchTerm) {
      result = result.filter(a => 
        a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange.start) {
      result = result.filter(a => new Date(a.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      result = result.filter(a => new Date(a.date) <= endDate);
    }

    setFilteredActivites(result);
  }, [filter, searchTerm, dateRange, activites]);

  const getTypeLabel = (type) => {
    switch(type) {
      case 'intervention': return 'Intervention';
      case 'rdv': return 'Rendez-vous';
      case 'facture': return 'Facture';
      case 'client': return 'Client';
      case 'vehicule': return 'Véhicule';
      default: return type;
    }
  };

  const getBadgeStyle = (type) => {
    const styles = {
      intervention: { backgroundColor: '#2196f3', color: '#fff' },
      rdv: { backgroundColor: '#ff9800', color: '#fff' },
      facture: { backgroundColor: '#4caf50', color: '#fff' },
      client: { backgroundColor: '#2196f3', color: '#fff' },
      vehicule: { backgroundColor: '#9c27b0', color: '#fff' }
    };
    return styles[type] || styles.intervention;
  };

  const handleExport = () => {
    const csvContent = filteredActivites.map(a => ({
      Date: new Date(a.date).toLocaleString('fr-FR'),
      Type: getTypeLabel(a.type),
      Action: a.action,
      Description: a.description
    }));
    
    const csv = [Object.keys(csvContent[0]).join(','), ...csvContent.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activites_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement des activités...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
          <h1>
            <FontAwesomeIcon icon={faHistory} style={{ marginRight: '10px' }} />
            Historique des activités
          </h1>
          <button onClick={handleExport} className="btn-outline">
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: '5px' }} />
            Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setFilter('all')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'all' ? '#e94560' : 'transparent',
                  color: filter === 'all' ? '#fff' : '#e94560',
                  border: filter === 'all' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
                Tous
              </button>
              <button 
                onClick={() => setFilter('intervention')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'intervention' ? '#e94560' : 'transparent',
                  color: filter === 'intervention' ? '#fff' : '#e94560',
                  border: filter === 'intervention' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faWrench} style={{ marginRight: '5px' }} />
                Interventions
              </button>
              <button 
                onClick={() => setFilter('rdv')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'rdv' ? '#e94560' : 'transparent',
                  color: filter === 'rdv' ? '#fff' : '#e94560',
                  border: filter === 'rdv' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                Rendez-vous
              </button>
              <button 
                onClick={() => setFilter('facture')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'facture' ? '#e94560' : 'transparent',
                  color: filter === 'facture' ? '#fff' : '#e94560',
                  border: filter === 'facture' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '5px' }} />
                Factures
              </button>
              <button 
                onClick={() => setFilter('client')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'client' ? '#e94560' : 'transparent',
                  color: filter === 'client' ? '#fff' : '#e94560',
                  border: filter === 'client' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                Clients
              </button>
              <button 
                onClick={() => setFilter('vehicule')}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === 'vehicule' ? '#e94560' : 'transparent',
                  color: filter === 'vehicule' ? '#fff' : '#e94560',
                  border: filter === 'vehicule' ? 'none' : '1px solid #e94560'
                }}
              >
                <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                Véhicules
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={{ width: '140px', marginBottom: 0, padding: '8px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#f5f5f5' }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={{ width: '140px', marginBottom: 0, padding: '8px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#f5f5f5' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#aaaaaa' }} />
              <input
                type="text"
                placeholder="Rechercher une activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: 0, flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: '#f5f5f5' }}
              />
            </div>
          </div>
        </div>

        {/* Statistiques des activités */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-card-value">{filteredActivites.length}</div>
            <div className="stat-card-label">Total activités</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{filteredActivites.filter(a => a.type === 'intervention').length}</div>
            <div className="stat-card-label">Interventions</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{filteredActivites.filter(a => a.type === 'rdv').length}</div>
            <div className="stat-card-label">Rendez-vous</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{filteredActivites.filter(a => a.type === 'facture').length}</div>
            <div className="stat-card-label">Factures</div>
          </div>
        </div>

        {/* Liste des activités */}
        {filteredActivites.length === 0 ? (
          <div className="card text-center">
            <FontAwesomeIcon icon={faHistory} style={{ fontSize: '3rem', color: '#aaaaaa', marginBottom: '15px' }} />
            <p>Aucune activité trouvée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredActivites.map((activite, index) => (
              <div key={activite.id || index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px',
                padding: '15px',
                backgroundColor: '#1e1e1e',
                borderRadius: '10px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${activite.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FontAwesomeIcon icon={activite.icon} style={{ color: activite.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        marginRight: '10px',
                        ...getBadgeStyle(activite.type)
                      }}>
                        {getTypeLabel(activite.type)}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#f5f5f5' }}>{activite.action}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#aaaaaa' }}>
                      <FontAwesomeIcon icon={faClock} style={{ marginRight: '5px' }} />
                      {new Date(activite.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#aaaaaa', marginBottom: '8px' }}>{activite.description}</p>
                  {activite.lien && (
                    <Link to={activite.lien} style={{ fontSize: '12px', color: '#e94560', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <FontAwesomeIcon icon={faEye} size="12px" />
                      Voir le détail
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Activites;