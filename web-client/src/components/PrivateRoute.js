import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    console.log('PrivateRoute - Token présent:', !!token);
    
    if (!token) {
        console.log('Pas de token, redirection vers login');
        return <Navigate to="/login" />;
    }
    
    return children;
}

export default PrivateRoute;