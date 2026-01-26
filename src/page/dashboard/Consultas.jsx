import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, User, Clock, FileText, Activity, 
    Search, RefreshCw, Stethoscope, ArrowRight 
} from 'lucide-react';
import atencionService from '../../services/atencionService';
import ConsultaExterna from '../../components/features/consultas/ConsultaExterna';
import './Atenciones.css'; 

const Consultas = () => {
    const navigate = useNavigate();
    const [atenciones, setAtenciones] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);
    const [mostrarModalConsulta, setMostrarModalConsulta] = useState(false);

    // Filtros iniciales: Fecha de HOY
    const [filtros, setFiltros] = useState({
        fecha: new Date().toISOString().split('T')[0],
        search: ''
    });

    useEffect(() => {
        cargarPacientesDelDia();
    }, [filtros.fecha]);

    const cargarPacientesDelDia = async () => {
        setLoading(true);
        try {
            console.log('🔄 Cargando pacientes para fecha:', filtros.fecha);
            
            // ✅ CORRECCIÓN: Usar el endpoint correcto con eager loading
            const response = await atencionService.getAtencionesPorFecha(filtros.fecha);
            
            console.log('✅ Respuesta del servicio:', response);
            console.log('✅ Datos recibidos:', response.data);

            if (response.success) {
                // ✅ Filtrar por estado en el frontend
                let atencionesFiltradas = response.data || [];
                
                // Filtrar solo las que están programadas, en espera o en atención
                atencionesFiltradas = atencionesFiltradas.filter(atencion => 
                    ['Programada', 'En Espera', 'En Atención'].includes(atencion.estado)
                );

                // Filtrar por búsqueda si hay texto
                if (filtros.search) {
                    const searchLower = filtros.search.toLowerCase();
                    atencionesFiltradas = atencionesFiltradas.filter(atencion => {
                        const nombreCompleto = `${atencion.paciente?.nombres || ''} ${atencion.paciente?.apellido_paterno || ''}`.toLowerCase();
                        const dni = atencion.paciente?.documento_identidad || '';
                        return nombreCompleto.includes(searchLower) || dni.includes(searchLower);
                    });
                }

                console.log('✅ Atenciones filtradas:', atencionesFiltradas.length);
                setAtenciones(atencionesFiltradas);
            } else {
                console.error('❌ Error en respuesta:', response);
                setAtenciones([]);
            }
        } catch (error) {
            console.error('❌ Error cargando pacientes:', error);
            setAtenciones([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAtender = (atencion) => {
        setAtencionSeleccionada(atencion);
        setMostrarModalConsulta(true);
        
        // Cambiar estado a "En Atención"
        atencionService.cambiarEstado(atencion.id, 'En Atención');
    };

    const handleVerHistorial = (pacienteId) => {
        navigate(`/dashboard/patients/${pacienteId}/history`);
    };

    const handleCerrarModal = () => {
        setMostrarModalConsulta(false);
        setAtencionSeleccionada(null);
        cargarPacientesDelDia();
    };

    return (
        <div className="appointments-container fade-in">
            
            {/* Modal de Consulta Externa */}
            {mostrarModalConsulta && atencionSeleccionada && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    zIndex: 2000, background: '#F3F4F6' 
                }}>
                    <ConsultaExterna 
                        atencion={atencionSeleccionada} 
                        onClose={handleCerrarModal} 
                    />
                </div>
            )}

            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Consulta Médica</h2>
                    <p className="page-subtitle">Pacientes programados para hoy</p>
                </div>
                
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    {/* Buscador */}
                    <div className="input-with-icon" style={{ minWidth: '250px' }}>
                        <Search size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar paciente..."
                            value={filtros.search}
                            onChange={(e) => setFiltros({...filtros, search: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && cargarPacientesDelDia()}
                            style={{paddingLeft: '35px', height: '40px'}}
                        />
                    </div>

                    {/* Selector de fecha */}
                    <div className="input-with-icon">
                        <Calendar size={18} />
                        <input 
                            type="date" 
                            value={filtros.fecha}
                            onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                            style={{paddingLeft: '35px', height: '40px', width: '160px'}}
                        />
                    </div>

                    {/* Botón actualizar */}
                    <button 
                        className="btn-search" 
                        onClick={cargarPacientesDelDia} 
                        title="Actualizar lista"
                        style={{ padding: '10px 16px', height: '40px' }}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* LISTADO DE PACIENTES */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Cargando pacientes...</p>
                </div>
            ) : atenciones.length > 0 ? (
                <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {atenciones.map((atencion) => (
                        <div key={atencion.id} className="appointment-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
                            
                            {/* Borde de color según estado */}
                            <div className="card-left-strip" style={{ 
                                backgroundColor: 
                                    atencion.estado === 'Atendida' ? '#10B981' : 
                                    atencion.estado === 'En Atención' ? '#F59E0B' : 
                                    '#3B82F6',
                                width: '8px'
                            }}/>

                            <div className="card-content" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                flexWrap: 'wrap',
                                gap: '20px',
                                width: '100%'
                            }}>
                                
                                {/* Columna 1: Hora y Estado */}
                                <div style={{ minWidth: '100px' }}>
                                    <div className="time-badge">
                                        <Clock size={16} />
                                        {atencion.hora_ingreso?.substring(0,5) || 'N/A'}
                                    </div>
                                    <div style={{ 
                                        marginTop: '8px', 
                                        fontSize: '0.75rem', 
                                        color: '#6B7280', 
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {atencion.estado}
                                    </div>
                                </div>

                                {/* Columna 2: Info del Paciente */}
                                <div style={{ flex: 1, padding: '0 20px', minWidth: '300px' }}>
                                    <h4 style={{ fontSize: '1.15rem', margin: '0 0 8px 0', color: '#1F2937', fontWeight: 600 }}>
                                        {atencion.paciente?.nombres} {atencion.paciente?.apellido_paterno} {atencion.paciente?.apellido_materno}
                                    </h4>
                                    
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', color: '#4B5563', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={14} /> 
                                            {atencion.paciente?.genero === 'M' ? 'Masculino' : 'Femenino'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={14} /> 
                                            DNI: {atencion.paciente?.documento_identidad}
                                        </span>
                                    </div>

                                    {/* Motivo de consulta */}
                                    {atencion.motivo_consulta && (
                                        <p style={{ 
                                            margin: '8px 0 0 0', 
                                            fontSize: '0.875rem', 
                                            color: '#6B7280', 
                                            fontStyle: 'italic',
                                            background: '#F9FAFB',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            borderLeft: '3px solid #FFC107'
                                        }}>
                                            <strong>Motivo:</strong> {atencion.motivo_consulta}
                                        </p>
                                    )}

                                    {/* Médico y Especialidad */}
                                    <div style={{ 
                                        marginTop: '8px', 
                                        fontSize: '0.8rem', 
                                        color: '#9CA3AF',
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        <span>
                                            👨‍⚕️ {atencion.medico?.user?.name || 'Médico sin nombre'}
                                        </span>
                                        <span>
                                            🏥 {atencion.medico?.especialidad?.nombre || 'Sin especialidad'}
                                        </span>
                                    </div>
                                </div>

                                {/* Columna 3: ACCIONES */}
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {/* Botón Ver Historial */}
                                    <button 
                                        onClick={() => handleVerHistorial(atencion.paciente_id)}
                                        className="btn-action"
                                        style={{ 
                                            minWidth: '120px',
                                            background: 'white', 
                                            border: '1px solid #D1D5DB',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 16px'
                                        }}
                                        title="Ver historial del paciente"
                                    >
                                        <Activity size={18} /> Historial
                                    </button>

                                    {/* Botón Atender */}
                                    <button 
                                        onClick={() => handleAtender(atencion)}
                                        className="btn-create" 
                                        style={{ 
                                            minWidth: '120px',
                                            padding: '10px 20px', 
                                            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Stethoscope size={18} /> ATENDER
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <User size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
                    <p>No hay pacientes en espera para la fecha seleccionada.</p>
                    <button className="btn-create" onClick={() => navigate('/dashboard/atenciones')}>
                        <Calendar size={18} /> Ir a Atenciones
                    </button>
                </div>
            )}
        </div>
    );
};

export default Consultas;