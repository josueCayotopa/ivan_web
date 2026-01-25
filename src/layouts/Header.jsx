// src/layout/Header.jsx (MEJORADO)
import React from 'react';
import { LogOut, Menu } from 'lucide-react';

const Header = ({ user, toggleSidebar, onLogout }) => {
    return (
        <header className="dashboard-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <h2 className="header-title">Clínica Dr. Ivan Pareja</h2>
            </div>

            <div className="header-right">
                <div className="user-info">
                    <span className="user-name">{user?.name || 'Usuario'}</span>
                    <div className="user-avatar-placeholder">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
                <button onClick={onLogout} className="btn-logout" title="Cerrar Sesión">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;