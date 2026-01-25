// src/page/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Activity, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        patients: 0,
        appointments: 0,
        doctors: 0,
        users: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Aquí puedes cargar las estadísticas reales desde tu API
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            // TODO: Llamar a tus services para obtener stats reales
            // const usersData = await userService.getUsers(1, '', 200);
            // const patientsData = await patientService.getPatients(1, '', 200);
            
            // Por ahora, datos de ejemplo
            setStats({
                patients: 0,
                appointments: 0,
                doctors: 0,
                users: 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { 
            title: 'Total Pacientes', 
            count: stats.patients, 
            icon: <Users size={32} />, 
            bg: '#EEF2FF',
            color: '#4F46E5',
            route: '/dashboard/patients'
        },
        { 
            title: 'Atenciones Hoy', 
            count: stats.appointments, 
            icon: <Calendar size={32} />, 
            bg: '#D1FAE5',
            color: '#10B981',
            route: '/dashboard/appointments'
        },
        { 
            title: 'Médicos Activos', 
            count: stats.doctors, 
            icon: <Activity size={32} />, 
            bg: '#FEF3C7',
            color: '#F59E0B',
            route: '/dashboard/medicos'
        },
        { 
            title: 'Usuarios Sistema', 
            count: stats.users, 
            icon: <Shield size={32} />, 
            bg: '#FCE7F3',
            color: '#EC4899',
            route: '/dashboard/users'
        },
    ];

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header-section">
                <div>
                    <h1 className="dashboard-title">Panel Principal</h1>
                    <p className="dashboard-subtitle">
                        Bienvenido de nuevo, <strong>{user?.name || 'Usuario'}</strong>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            ) : (
                <div className="stats-grid">
                    {cards.map((card, index) => (
                        <div 
                            key={index} 
                            className="stat-card"
                            onClick={() => navigate(card.route)}
                        >
                            <div className="stat-content">
                                <div className="stat-info">
                                    <p className="stat-label">{card.title}</p>
                                    <h3 className="stat-value">{card.count}</h3>
                                </div>
                                <div 
                                    className="stat-icon" 
                                    style={{ backgroundColor: card.bg, color: card.color }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions-card">
                <h3 className="section-title">Accesos Directos</h3>
                <div className="actions-grid">
                    <button 
                        className="action-btn primary"
                        onClick={() => navigate('/dashboard/patients')}
                    >
                        <Users size={20} />
                        <span>Registrar Paciente</span>
                    </button>
                    
                    <button 
                        className="action-btn secondary"
                        onClick={() => navigate('/dashboard/appointments')}
                    >
                        <Calendar size={20} />
                        <span>Nueva Atención</span>
                    </button>
                    
                    <button 
                        className="action-btn secondary"
                        onClick={() => navigate('/dashboard/medicos')}
                    >
                        <Activity size={20} />
                        <span>Ver Médicos</span>
                    </button>
                    
                    <button 
                        className="action-btn secondary"
                        onClick={() => navigate('/dashboard/users')}
                    >
                        <Shield size={20} />
                        <span>Gestionar Usuarios</span>
                    </button>
                </div>
            </div>

            {/* Recent Activity (Opcional) */}
            <div className="recent-activity-card">
                <h3 className="section-title">Actividad Reciente</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
                            <Users size={16} />
                        </div>
                        <div className="activity-content">
                            <p className="activity-text">Sistema iniciado correctamente</p>
                            <span className="activity-time">Hace unos momentos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;