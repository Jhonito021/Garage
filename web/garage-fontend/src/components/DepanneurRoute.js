// frontend/src/components/DepanneurRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function DepanneurRoute({ children }) {
    const depanneur = localStorage.getItem('depanneur');
    
    if (!depanneur) {
        return <Navigate to="/depanneur/login" />;
    }
    
    try {
        const user = JSON.parse(depanneur);
        if (user.role !== 'technicien') {
            localStorage.removeItem('depanneur');
            return <Navigate to="/depanneur/login" />;
        }
    } catch (e) {
        localStorage.removeItem('depanneur');
        return <Navigate to="/depanneur/login" />;
    }
    
    return children;
}

export default DepanneurRoute;