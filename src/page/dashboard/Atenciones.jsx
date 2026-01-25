// src/page/dashboard/Atenciones.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, Plus, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import atencionService from '../../services/atencionService.js';
import FormularioAtencion from '../../components/features/atenciones/FormularioAtencion';
import './Atenciones.css';

const Atenciones = () => {
    const [atenciones, setAtenciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAtencion, setSelectedAtencion] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        fecha: new Date().toISOString().split('T')[0],
        paciente_search: '',
        medico_id: '',
        estado: ''
    });

    useEffect(() => {
        cargarAtenciones();
    }, [filtros.fecha]);

    const cargarAtenciones = async () => {
        setLoading(true);
        try {
            const response = await atencionService.getAtenciones(1, {
                fecha: filtros.fecha,
                ...(filtros.paciente_search && { paciente: filtros.paciente_search }),
                ...(filtros.medico_id && { medico_id: filtros.medico_id }),
                ...(filtros.estado && { estado: filtros.estado })
            });

            if (response.status === 200 || response.success) {
                setAtenciones(response.data || []);
            }
        } catch (error) {
            console.error('Error cargando atenciones:', error);
            Swal.fire('Error', 'No se pudieron cargar las atenciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const handleBuscar = () => {
        cargarAtenciones();
    };

    const handleAbrirModal = (atencion = null) => {
        setSelectedAtencion(atencion);
        setShowModal(true);
    };

    const handleCerrarModal = (debeRecargar = false) => {
        setShowModal(false);
        setSelectedAtencion(null);
        if (debeRecargar) {
            cargarAtenciones();
        }
    };

    const obtenerColorEstado = (estado) => {
        const colores = {
            'pendiente': '#FEF3C7',
            'confirmada': '#DEF7EC',
            'en_atencion': '#E0E7FF',
            'atendida': '#D1FAE5',
            'cancelada': '#FEE2E2'
        };
        return colores[estado] || '#F3F4F6';
    };

    const obtenerTextoEstado = (estado) => {
        const textos = {
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada',
            'en_atencion': 'En Atención',
            'atendida': 'Atendida',
            'cancelada': 'Cancelada'
        };
        return textos[estado] || estado;
    };

    return (
        <div className="atenciones-container fade-in">
            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Atenciones del Día</h2>
                    <p className="page-subtitle">Gestión de citas médicas y atenciones</p>
                </div>
                <button className="btn-create" onClick={() => handleAbrirModal()}>
                    <Plus size={18} /> Nueva Atención
                </button>
            </div>

            {/* FILTROS */}
            <div className="filters-card fade-in-up">
                <div className="filters-row primary-filters">
                    <div className="filter-group">
                        <label>Fecha</label>
                        <div className="input-with-icon">
                            <Calendar size={16} />
                            <input
                                type="date"
                                value={filtros.fecha}
                                onChange={(e) => handleFiltroChange('fecha', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Buscar Paciente</label>
                        <div className="input-with-icon">
                            <User size={16} />
                            <input
                                type="text"
                                placeholder="Nombre o DNI..."
                                value={filtros.paciente_search}
                                onChange={(e) => handleFiltroChange('paciente_search', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Estado</label>
                        <div className="input-with-icon">
                            <Filter size={16} />
                            <select
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="en_atencion">En Atención</option>
                                <option value="atendida">Atendida</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn-search" onClick={handleBuscar}>
                        <Search size={16} />
                        Buscar
                    </button>
                </div>
            </div>

            {/* LISTA DE ATENCIONES */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Cargando atenciones...</p>
                </div>
            ) : (
                <>
                    <h3 className="section-title">
                        {atenciones.length} Atenciones para el {new Date(filtros.fecha + 'T00:00:00').toLocaleDateString('es-PE', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </h3>

                    {atenciones.length > 0 ? (
                        <div className="cards-grid fade-in-up">
                            {atenciones.map((atencion) => (
                                <div key={atencion.id} className="appointment-card">
                                    <div 
                                        className="card-left-strip" 
                                        style={{ backgroundColor: obtenerColorEstado(atencion.estado) }}
                                    />
                                    
                                    <div className="card-content">
                                        <div className="time-badge">
                                            <Clock size={14} />
                                            {atencion.hora_cita || 'Sin hora'}
                                        </div>

                                        <div className="patient-info">
                                            <h4>{atencion.paciente?.nombres || 'Paciente desconocido'}</h4>
                                            <span className="dni-tag">
                                                DNI: {atencion.paciente?.documento_identidad || 'N/A'}
                                            </span>
                                        </div>

                                        <div className="appt-details">
                                            <div className="detail-item">
                                                <Stethoscope size={16} />
                                                <span>
                                                    {atencion.medico?.user?.name || 'Sin médico asignado'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <FileText size={16} />
                                                <span>
                                                    {atencion.tipo_atencion || 'Consulta General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <div 
                                            className="status-pill"
                                            style={{ 
                                                backgroundColor: obtenerColorEstado(atencion.estado),
                                                color: '#111827'
                                            }}
                                        >
                                            {obtenerTextoEstado(atencion.estado)}
                                        </div>
                                        
                                        <button 
                                            className="btn-action"
                                            onClick={() => handleAbrirModal(atencion)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Calendar size={48} style={{ color: '#9CA3AF' }} />
                            <p>No hay atenciones programadas para esta fecha</p>
                            <button className="btn-create" onClick={() => handleAbrirModal()}>
                                <Plus size={18} /> Crear Nueva Atención
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL */}
            {showModal && (
                <FormularioAtencion
                    atencion={selectedAtencion}
                    onClose={handleCerrarModal}
                    onSuccess={() => handleCerrarModal(true)}
                />
            )}
        </div>
    );
};

export default Atenciones;