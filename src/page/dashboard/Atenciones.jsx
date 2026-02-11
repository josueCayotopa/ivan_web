import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, User, Stethoscope, FileText, Plus,
    Search, Filter, LayoutGrid, List, Eye, Award
} from 'lucide-react';
import Swal from 'sweetalert2';
import atencionService from '../../services/atencionService.js';
import FormularioAtencion from '../../components/features/atenciones/FormularioAtencion';
import './Atenciones.css';
import { getFechaLocal } from '../../utils/dateUtils';
const TIPOS_ATENCION = [
    'Consulta',
    'Procedimiento Menor',
    'Cirugía',
    'Control',
    'Emergencia',
    'Examen'
];
const Atenciones = () => {
    const [atenciones, setAtenciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAtencion, setSelectedAtencion] = useState(null);

    const [viewMode, setViewMode] = useState('table');

    const [filtros, setFiltros] = useState({
        fecha: getFechaLocal(),
        paciente_search: '',
        medico_id: '',
        estado: ''
    });
    // Actualiza las dependencias del useEffect
    useEffect(() => {
        // Agregamos un pequeño retraso (debounce) para no saturar la API al escribir
        const timer = setTimeout(() => {
            cargarAtenciones();
        }, 500);

        return () => clearTimeout(timer);
    }, [filtros.fecha, filtros.paciente_search, filtros.estado, filtros.medico_id]);
    const cargarAtenciones = async () => {
        setLoading(true);
        try {
            let response;

            // Si hay un término de búsqueda largo, usamos búsqueda global
            if (filtros.paciente_search && filtros.paciente_search.length > 2) {
                response = await atencionService.searchAtenciones(filtros.paciente_search);
            } else {
                // De lo contrario, carga normal por fecha
                response = await atencionService.getAtencionesPorFecha(filtros.fecha);
            }

            if (response.success) {
                // El buscador del backend ya filtra por nombre/DNI, 
                // solo aplicamos filtros de estado o médico si están seleccionados
                let datos = response.data || [];

                if (filtros.estado) {
                    datos = datos.filter(a => a.estado === filtros.estado);
                }
                if (filtros.medico_id) {
                    datos = datos.filter(a => a.medico_id === parseInt(filtros.medico_id));
                }

                setAtenciones(datos);
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            setAtenciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const handleAbrirModal = (atencion = null) => {
        setSelectedAtencion(atencion);
        setShowModal(true);
    };

    const handleCerrarModal = (recargar = false) => {
        setShowModal(false);
        setSelectedAtencion(null);
        if (recargar) cargarAtenciones();
    };

    const obtenerColorEstado = (estado, tipo = 'bg') => {
        const esCancelado = estado === 'Cancelada' || estado === 'No Asistió';

        if (esCancelado) return tipo === 'bg' ? '#FEE2E2' : '#DC2626';

        const colores = {
            'Programada': '#E0F2FE',
            'En Espera': '#FEF3C7',
            'En Atención': '#F3E8FF',
            'Atendida': '#D1FAE5',
        };
        return colores[estado] || '#F3F4F6';
    };

    return (
        <div className="appointments-container fade-in">

            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Atenciones del Día</h2>
                    <p className="page-subtitle">
                        Gestión de citas para el {new Date(filtros.fecha + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '8px', border: 'none', background: viewMode === 'table' ? '#F3F4F6' : 'transparent',
                                borderRadius: '6px', cursor: 'pointer', color: viewMode === 'table' ? '#FFC107' : '#9CA3AF'
                            }}
                            title="Vista Tabla"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            style={{
                                padding: '8px', border: 'none', background: viewMode === 'cards' ? '#F3F4F6' : 'transparent',
                                borderRadius: '6px', cursor: 'pointer', color: viewMode === 'cards' ? '#FFC107' : '#9CA3AF'
                            }}
                            title="Vista Tarjetas"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    <button className="btn-create" onClick={() => handleAbrirModal()}>
                        <Plus size={18} /> Nueva Atención
                    </button>
                </div>
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
                                placeholder="Nombre, DNI o Historia..."
                                value={filtros.paciente_search}
                                onChange={(e) => handleFiltroChange('paciente_search', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Estado</label>
                        <div className="input-with-icon">
                            <Filter size={16} />
                            <select value={filtros.estado} onChange={(e) => handleFiltroChange('estado', e.target.value)}>
                                <option value="">Todos</option>
                                <option value="Programada">Programada</option>
                                <option value="En Espera">En Espera</option>
                                <option value="En Atención">En Atención</option>
                                <option value="Atendida">Atendida</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn-search" onClick={cargarAtenciones}>
                        <Search size={16} /> Buscar
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Cargando atenciones...</p>
                </div>
            ) : atenciones.length > 0 ? (
                <>
                    {/* VISTA: TARJETAS */}
                    {viewMode === 'cards' && (
                        <div className="cards-grid fade-in-up">
                            {atenciones.map((atencion) => (
                                <div key={atencion.id} className="appointment-card">
                                    <div
                                        className="card-left-strip"
                                        style={{ backgroundColor: obtenerColorEstado(atencion.estado, 'border') }}
                                    />

                                    <div className="card-content">
                                        <div className="time-badge">
                                            <Clock size={14} />
                                            {atencion.hora_ingreso ? atencion.hora_ingreso.substring(0, 5) : '--:--'}
                                        </div>

                                        <div className="patient-info">
                                            <h4>{atencion.paciente?.nombres} {atencion.paciente?.apellido_paterno}</h4>
                                            <span className="dni-tag">
                                                {atencion.tipo_cobertura} • {atencion.paciente?.documento_identidad}
                                            </span>
                                        </div>

                                        <div className="appt-details">
                                            {/* ✅ MÉDICO */}
                                            <div className="detail-item">
                                                <Stethoscope size={16} />
                                                <span>
                                                    {atencion.medico?.user?.name || 'Médico sin nombre'}
                                                </span>
                                            </div>

                                            {/* ✅ ESPECIALIDAD */}
                                            <div className="detail-item">
                                                <Award size={16} />
                                                <span>
                                                    {atencion.medico?.especialidad?.nombre || 'General'}
                                                </span>
                                            </div>

                                            <div className="detail-item">
                                                <FileText size={16} />
                                                <span>{atencion.tipo_atencion}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <div
                                            className="status-pill"
                                            style={{
                                                backgroundColor: obtenerColorEstado(atencion.estado, 'bg'),
                                                color: '#1F2937'
                                            }}
                                        >
                                            {atencion.estado}
                                        </div>

                                        <button className="btn-action" onClick={() => handleAbrirModal(atencion)}>
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* VISTA: TABLA */}
                    {viewMode === 'table' && (
                        <div className="table-responsive-container fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="patients-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    <tr>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Hora</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Paciente</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Médico</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Especialidad</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Tipo</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Estado</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {atenciones.map((atencion) => (
                                        <tr key={atencion.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={{ padding: '16px 24px', color: '#374151', fontWeight: 500 }}>
                                                {atencion.hora_ingreso?.substring(0, 5)}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                                    {atencion.paciente?.nombres} {atencion.paciente?.apellido_paterno}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                                    {atencion.paciente?.documento_identidad}
                                                </div>
                                            </td>
                                            {/* ✅ MÉDICO */}
                                            <td style={{ padding: '16px 24px', color: '#4B5563', fontWeight: 500 }}>
                                                {atencion.medico?.user?.name || 'Médico sin nombre'}
                                            </td>
                                            {/* ✅ ESPECIALIDAD */}
                                            <td style={{ padding: '16px 24px', color: '#4B5563' }}>
                                                {atencion.medico?.especialidad?.nombre || 'General'}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span className="dni-tag">{atencion.tipo_atencion}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span
                                                    className="status-pill"
                                                    style={{
                                                        backgroundColor: obtenerColorEstado(atencion.estado, 'bg'),
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {atencion.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleAbrirModal(atencion)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#2563EB',
                                                        cursor: 'pointer',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.color = '#1D4ED8'}
                                                    onMouseOut={(e) => e.target.style.color = '#2563EB'}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <Calendar size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
                    <p>No hay atenciones programadas para esta fecha</p>
                    <button className="btn-create" onClick={() => handleAbrirModal()} style={{ margin: '0 auto' }}>
                        <Plus size={18} /> Registrar Atención
                    </button>
                </div>
            )}

            {showModal && (
                <FormularioAtencion
                    atencion={selectedAtencion}
                    onClose={() => handleCerrarModal()}
                    onSuccess={() => handleCerrarModal(true)}
                />
            )}
        </div>
    );
};

export default Atenciones;