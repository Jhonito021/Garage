import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages client
import Home from './pages/client/Home';
import Login from './pages/client/Login';
import Register from './pages/client/Register';
import Dashboard from './pages/client/Dashboard';
import Vehicles from './pages/client/Vehicles';
import Rdv from './pages/client/Rdv';
import Historique from './pages/client/Historique';
import Factures from './pages/client/Factures';

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

import Acceuil from './pages/Home';

function App() {
    return (
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
            </Routes>
        </Router>
    );
}

export default App;