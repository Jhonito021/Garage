import React from 'react';
import { Navigate } from 'react-router-dom';

function TechnicienRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isTechnicien = user.role === 'technicien';
    
    if (!isTechnicien) {
        return <Navigate to="/technicien/login" />;
    }
    
    return children;
}

export default TechnicienRoute;