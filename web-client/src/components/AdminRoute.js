import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';
    
    if (!isAdmin) {
        return <Navigate to="/admin/login" />;
    }
    
    return children;
}

export default AdminRoute;