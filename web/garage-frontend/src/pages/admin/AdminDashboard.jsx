import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEuroSign, 
  faWrench, 
  faUsers, 
  faCalendarAlt, 
  faCar, 
  faChartLine, 
  faFileInvoice,
  faEye,
  faArrowRight,
  faCheckCircle,
  faClock,
  faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    ca_mois: 0,
    total_clients: 0,
    total_interventions_mois: 0,
    total_rdv_mois: 0,
    interventions_par_technicien: [],
    ca_par_mois: [],
    interventions_par_statut: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/statistiques/dashboard');
        console.log('Stats reçues:', res.data);
        
        // Données pour le graphique CA par mois (simulées si non disponibles)
        const caParMois = res.data.ca_par_mois || [
          { mois: 'Jan', montant: 12500 },
          { mois: 'Fév', montant: 15200 },
          { mois: 'Mar', montant: 18900 },
          { mois: 'Avr', montant: 14200 },
          { mois: 'Mai', montant: 21000 },
          { mois: 'Jun', montant: 23500 },
        ];
        
        // Données pour le graphique des statuts
        const interventionsParStatut = res.data.interventions_par_statut || [
          { name: 'Terminées', value: 45, color: '#4caf50' },
          { name: 'En cours', value: 12, color: '#ff9800' },
          { name: 'Prévues', value: 28, color: '#2196f3' },
        ];
        
        setStats({
          ca_mois: parseFloat(res.data.ca_mois) || 0,
          total_clients: res.data.total_clients || 0,
          total_interventions_mois: res.data.total_interventions_mois || 0,
          total_rdv_mois: res.data.total_rdv_mois || 0,
          interventions_par_technicien: res.data.interventions_par_technicien || [],
          ca_par_mois: caParMois,
          interventions_par_statut: interventionsParStatut
        });
      } catch (err) {
        console.error('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatMontant = (montant) => {
    const nombre = parseFloat(montant);
    if (isNaN(nombre)) return '0.00';
    return nombre.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const statutColors = {
    'Terminées': '#4caf50',
    'En cours': '#ff9800',
    'Prévues': '#2196f3'
  };

  const statutIcons = {
    'Terminées': faCheckCircle,
    'En cours': faClock,
    'Prévues': faHourglassHalf
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">
          <div className="loading">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        {/* En-tête */}
        <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ marginBottom: '5px' }}>Tableau de bord</h1>
            <p className="text-light">Bienvenue dans votre espace d'administration</p>
          </div>
          {/* <div className="flex gap-10">
            <select 
              className="form-control" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: 'auto', marginBottom: 0 }}
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
            <Link to="/admin/rapports">
              <button className="btn-outline">
                <FontAwesomeIcon icon={faFileInvoice} style={{ marginRight: '5px' }} />
                Rapports
              </button>
            </Link>
          </div> */}
        </div>

        {/* Cartes statistiques */}
        <div className="grid-4" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <div className="stat-card-icon">
              <FontAwesomeIcon icon={faEuroSign} />
            </div>
            <div className="stat-card-value">{formatMontant(stats.ca_mois)} €</div>
            <div className="stat-card-label">Chiffre d'affaires du mois</div>
            <div className="stat-card-trend">
              <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '5px' }} />
              +12% vs mois dernier
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-icon">
              <FontAwesomeIcon icon={faWrench} />
            </div>
            <div className="stat-card-value">{stats.total_interventions_mois}</div>
            <div className="stat-card-label">Interventions ce mois</div>
            <div className="stat-card-trend">
              <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '5px', color: '#4caf50' }} />
              +{Math.round(stats.total_interventions_mois * 0.15)} vs mois dernier
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-card-value">{stats.total_clients}</div>
            <div className="stat-card-label">Clients actifs</div>
            <div className="stat-card-trend">
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '5px' }} />
              +{Math.round(stats.total_clients * 0.08)} nouveaux ce mois
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-icon">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div className="stat-card-value">{stats.total_rdv_mois}</div>
            <div className="stat-card-label">Rendez-vous ce mois</div>
            <div className="stat-card-trend">
              <FontAwesomeIcon icon={faEye} style={{ marginRight: '5px' }} />
              Taux d'occupation: 78%
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid-2" style={{ marginBottom: '30px' }}>
          {/* Graphique CA mensuel */}
          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '10px' }} />
              Évolution du CA
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.ca_par_mois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="mois" stroke="#aaaaaa" />
                <YAxis stroke="#aaaaaa" tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value) => [`${formatMontant(value)} €`, 'CA']}
                />
                <Legend />
                <Line type="monotone" dataKey="montant" stroke="#e94560" strokeWidth={2} dot={{ fill: '#e94560', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique des statuts d'interventions */}
          <div className="card">
            <h2>
              <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
              Interventions par statut
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.interventions_par_statut}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.interventions_par_statut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex" style={{ justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
              {stats.interventions_par_statut.map((item, idx) => (
                <div key={idx} className="flex" style={{ alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                  <span className="text-light">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interventions par technicien */}
        {stats.interventions_par_technicien.length > 0 && (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />
              Performance des techniciens
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.interventions_par_technicien}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="nom" stroke="#aaaaaa" />
                <YAxis stroke="#aaaaaa" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="nb_interventions" fill="#e94560" radius={[8, 8, 0, 0]}>
                  {stats.interventions_par_technicien.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#e94560" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actions rapides */}
        {/* <div className="card">
          <h2>Actions rapides</h2>
          <div className="grid-4" style={{ marginTop: '20px' }}>
            <Link to="/admin/planning">
              <button className="btn-primary" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />
                Voir le planning
              </button>
            </Link>
            <Link to="/admin/interventions">
              <button className="btn-primary" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faWrench} style={{ marginRight: '10px' }} />
                Gérer interventions
              </button>
            </Link>
            <Link to="/admin/clients">
              <button className="btn-primary" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />
                Gérer clients
              </button>
            </Link>
            <Link to="/admin/factures">
              <button className="btn-primary" style={{ width: '100%' }}>
                <FontAwesomeIcon icon={faEuroSign} style={{ marginRight: '10px' }} />
                Gérer factures
              </button>
            </Link>
          </div>
        </div> */}

        {/* Dernières activités */}
        {/* <div className="card" style={{ marginTop: '30px' }}>
          <div className="flex-between">
            <h2>Dernières activités</h2>
            <Link to="/admin/activites">
              <button className="btn-outline btn-sm">
                Voir tout <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '5px' }} />
              </button>
            </Link>
          </div>
          <div className="activities-list" style={{ marginTop: '20px' }}>
            <div className="activity-item">
              <div className="activity-icon"><FontAwesomeIcon icon={faCar} /></div>
              <div className="activity-content">
                <p className="activity-text">Nouveau véhicule ajouté: <strong>Renault Clio</strong></p>
                <p className="activity-time">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><FontAwesomeIcon icon={faWrench} /></div>
              <div className="activity-content">
                <p className="activity-text">Intervention terminée: <strong>Vidange - Client Dupont</strong></p>
                <p className="activity-time">Il y a 1 heure</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><FontAwesomeIcon icon={faFileInvoice} /></div>
              <div className="activity-content">
                <p className="activity-text">Nouvelle facture créée: <strong>#12345</strong></p>
                <p className="activity-time">Il y a 3 heures</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default AdminDashboard;