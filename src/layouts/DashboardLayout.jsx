// Ubicación: src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 Nota: Aquí es solo un nivel "../"
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const { user, logout } = useAuth();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        logout();
    };

    const closeSidebarMobile = () => {
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {/* Overlay para móvil */}
            {isSidebarOpen && window.innerWidth <= 768 && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <Sidebar 
                isOpen={isSidebarOpen} 
                user={user} 
                onLinkClick={closeSidebarMobile} 
            />

            <div className="main-content">
                <Header
                    user={user}
                    toggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                />

                <div className="content-wrapper">
                    {/* 👇 AQUÍ SE RENDERIZAN TUS PÁGINAS (Home, Pacientes, etc.) */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;