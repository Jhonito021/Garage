// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TechnicienRoute from './components/TechnicienRoute';
import Profil from './pages/client/Profil';

// Pages client
import Home from './pages/client/Home';
import Login from './pages/client/Login';
import Register from './pages/client/Register';
import Dashboard from './pages/client/Dashboard';
import Vehicles from './pages/client/Vehicles';
import Rdv from './pages/client/Rdv';
import Historique from './pages/client/Historique';
import Factures from './pages/client/Factures';
import SuiviInterventions from './pages/client/SuiviInterventions';
import Depannage from './pages/client/Depannage';

// Pages admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Planning from './pages/admin/Planning';
import Interventions from './pages/admin/Interventions';
import Stocks from './pages/admin/Stocks';
import Devis from './pages/admin/Devis';
import FacturesGestion from './pages/admin/FacturesGestion';
import Clients from './pages/admin/Clients';
import Vidanges from './pages/admin/Vidanges';
import Parametres from './pages/admin/Parametres';
import Techniciens from './pages/admin/Techniciens';
import Activites from './pages/admin/Activites';
import AdminDepannage from './pages/admin/AdminDepannage';

// Pages technicien
import TechnicienLogin from './pages/technicien/TechnicienLogin';
import TechnicienDashboard from './pages/technicien/TechnicienDashboard';
import TechnicienInterventions from './pages/technicien/TechnicienInterventions';

// Pages depanneur
import DepanneurLogin from './pages/depanneur/DepanneurLogin';
import DepanneurDashboard from './pages/depanneur/DepanneurDashboard';
import DepanneurMissions from './pages/depanneur/DepanneurMissions';
import DepanneurSuivi from './pages/depanneur/DepanneurSuivi';
import DepanneurRoute from './components/DepanneurRoute';

import Acceuil from './pages/Home';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Navbar />
                <Routes>
                    {/* Routes client */}
                    <Route path="/" element={<Acceuil />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/vehicles" element={<PrivateRoute><Vehicles /></PrivateRoute>} />
                    <Route path="/rdv" element={<PrivateRoute><Rdv /></PrivateRoute>} />
                    <Route path="/historique" element={<PrivateRoute><Historique /></PrivateRoute>} />
                    <Route path="/factures" element={<PrivateRoute><Factures /></PrivateRoute>} />
                    <Route path="/suivi" element={<PrivateRoute><SuiviInterventions /></PrivateRoute>} />
                    <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
                    <Route path="/depannage" element={<PrivateRoute><Depannage /></PrivateRoute>} />
                    
                    {/* Routes admin */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/planning" element={<AdminRoute><Planning /></AdminRoute>} />
                    <Route path="/admin/interventions" element={<AdminRoute><Interventions /></AdminRoute>} />
                    <Route path="/admin/stocks" element={<AdminRoute><Stocks /></AdminRoute>} />
                    <Route path="/admin/devis" element={<AdminRoute><Devis /></AdminRoute>} />
                    <Route path="/admin/factures" element={<AdminRoute><FacturesGestion /></AdminRoute>} />
                    <Route path="/admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />
                    <Route path="/admin/vidanges" element={<AdminRoute><Vidanges /></AdminRoute>} />
                    <Route path="/admin/parametres" element={<AdminRoute><Parametres /></AdminRoute>} />
                    <Route path="/admin/techniciens" element={<AdminRoute><Techniciens /></AdminRoute>} />
                    <Route path="/admin/activites" element={<AdminRoute><Activites /></AdminRoute>} />
                    <Route path="/admin/depannage" element={<AdminRoute><AdminDepannage /></AdminRoute>} />

                    {/* Routes technicien */}
                    <Route path="/technicien/login" element={<TechnicienLogin />} />
                    <Route path="/technicien" element={<TechnicienRoute><TechnicienDashboard /></TechnicienRoute>} />
                    <Route path="/technicien/interventions" element={<TechnicienRoute><TechnicienInterventions /></TechnicienRoute>} />
                    
                    {/* Routes depanneur */}
                    <Route path="/depanneur/login" element={<DepanneurLogin />} />
                    <Route path="/depanneur" element={<DepanneurRoute><DepanneurDashboard /></DepanneurRoute>} />
                    <Route path="/depanneur/missions" element={<DepanneurRoute><DepanneurMissions /></DepanneurRoute>} />
                    <Route path="/depanneur/suivi" element={<DepanneurRoute><DepanneurSuivi /></DepanneurRoute>} />
                    {/* <Route path="/depanneur/historique" element={<DepanneurRoute><DepanneurHistorique /></DepanneurRoute>} /> */}
                    {/* <Route path="/depanneur/profil" element={<DepanneurRoute><DepanneurProfil /></DepanneurRoute>} /> */}
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;