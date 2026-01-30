// src/page/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Calendar, Activity, Shield, 
    Clock, CheckCircle, FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import pacienteService from '../../services/pacienteService';
import atencionService from '../../services/atencionService';
import consultaExternaService from '../../services/consultaExternaService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Estado para los datos reales
    const [stats, setStats] = useState({
        pacientes: 0,
        atencionesHoy: 0,
        atencionesPendientes: 0,
        consultasMes: 0,
        atendidos: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Ejecutamos las 3 peticiones en paralelo
            const [resPacientes, resAtenciones, resConsultas] = await Promise.all([
                pacienteService.getStats(),
                atencionService.getStats(),
                consultaExternaService.getEstadisticas()
            ]);

            console.log('📊 Datos Dashboard:', { resPacientes, resAtenciones, resConsultas });

            setStats({
                pacientes: resPacientes.data?.total || 0,
                // Ajustamos campos según tu API (a veces viene como 'total_hoy' o 'total')
                atencionesHoy: resAtenciones.data?.total_hoy || resAtenciones.data?.total || 0,
                atencionesPendientes: resAtenciones.data?.pendientes || resAtenciones.data?.en_espera || 0,
                consultasMes: resConsultas.data?.total_mes || 0,
                atendidos: resAtenciones.data?.atendidas || resAtenciones.data?.finalizadas || 0
            });

        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Definimos las tarjetas usando los datos del estado 'stats'
    const cards = [
        { 
            title: 'Total Pacientes', 
            count: stats.pacientes, 
            icon: <Users size={32} />, 
            bg: '#EEF2FF',
            color: '#4F46E5',
            route: '/dashboard/pacientes'
        },
        { 
            title: 'Citas Hoy', 
            count: stats.atencionesHoy, 
            icon: <Calendar size={32} />, 
            bg: '#D1FAE5',
            color: '#10B981',
            route: '/dashboard/atenciones'
        },
        { 
            title: 'Consultas (Mes)', 
            count: stats.consultasMes, 
            icon: <FileText size={32} />, 
            bg: '#FEF3C7',
            color: '#F59E0B',
            route: '/dashboard/consultas' // O la ruta que tengas para historias
        },
        { 
            title: 'Atendidos Hoy', 
            count: stats.atendidos, 
            icon: <CheckCircle size={32} />, 
            bg: '#FCE7F3',
            color: '#EC4899',
            route: '/dashboard/atenciones'
        },
    ];

    return (
        <div className="dashboard-page fade-in">
            {/* Header */}
            <div className="dashboard-header-section">
                <div>
                    <h1 className="dashboard-title">Panel Principal</h1>
                    <p className="dashboard-subtitle">
                        Bienvenido de nuevo, <strong>{user?.name || 'Doctor'}</strong>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Actualizando indicadores...</p>
                </div>
            ) : (
                <div className="stats-grid">
                    {cards.map((card, index) => (
                        <div 
                            key={index} 
                            className="stat-card"
                            onClick={() => card.route && navigate(card.route)}
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
                        onClick={() => navigate('/dashboard/pacientes')}
                    >
                        <Users size={20} />
                        <span>Registrar Paciente</span>
                    </button>
                    
                    <button 
                        className="action-btn secondary"
                        onClick={() => navigate('/dashboard/atenciones')}
                    >
                        <Calendar size={20} />
                        <span>Nueva Atención</span>
                    </button>
                    
                    <button 
                        className="action-btn secondary"
                        onClick={() => navigate('/dashboard/atenciones')} // Reusamos ruta si no tienes /medicos aún
                    >
                        <Activity size={20} />
                        <span>Ver Agenda</span>
                    </button>
                    
                    {/* Botón extra si quieres */}
                    <button 
                        className="action-btn secondary"
                        onClick={() => window.location.reload()}
                    >
                        <Clock size={20} />
                        <span>Actualizar Datos</span>
                    </button>
                </div>
            </div>

            {/* Recent Activity (Resumen rápido) */}
            <div className="recent-activity-card">
                <h3 className="section-title">Estado del Día</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
                            <Clock size={16} />
                        </div>
                        <div className="activity-content">
                            <p className="activity-text">
                                Tienes <strong>{stats.atencionesPendientes}</strong> pacientes en espera.
                            </p>
                            <span className="activity-time">Actualizado ahora mismo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;