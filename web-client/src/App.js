import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Rdv from './pages/Rdv';
import Historique from './pages/Historique';
import Factures from './pages/Factures';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/vehicles" element={
                    <PrivateRoute>
                        <Vehicles />
                    </PrivateRoute>
                } />
                <Route path="/rdv" element={
                    <PrivateRoute>
                        <Rdv />
                    </PrivateRoute>
                } />
                <Route path="/historique" element={
                    <PrivateRoute>
                        <Historique />
                    </PrivateRoute>
                } />
                <Route path="/factures" element={
                    <PrivateRoute>
                        <Factures />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;