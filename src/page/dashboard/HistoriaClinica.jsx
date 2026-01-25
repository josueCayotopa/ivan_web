import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, User, FileText, Activity, Clock,
    ArrowLeft, PlusCircle, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import Swal from 'sweetalert2';
import patientService from '../../services/pacienteService';
import './HistoriaClinica.css';

const HistoriaClinica = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [expandedAttention, setExpandedAttention] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await patientService.getHistorial(id);
                if (response.success) {
                    setPatient(response.data.paciente);
                    setHistory(response.data.atenciones || []);
                } else {
                    Swal.fire('Error', 'No se pudo cargar el historial', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHistory();
        }
    }, [id]);

    const handleNewAttention = () => {
        navigate('/dashboard/atenciones', { state: { paciente_id: id } });
    };

    const toggleAttention = (attentionId) => {
        if (expandedAttention === attentionId) {
            setExpandedAttention(null);
        } else {
            setExpandedAttention(attentionId);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!patient) {
        return <div className="p-6 text-center text-gray-500">Paciente no encontrado</div>;
    }

    return (
        <div className="historia-container">
            {/* Header del Paciente */}
            <div className="patient-header-card">
                <div className="header-left">
                    <button
                        onClick={() => navigate('/dashboard/pacientes')}
                        className="back-button"
                        title="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="patient-info">
                        <h1>{patient.nombre_completo}</h1>
                        <div className="patient-meta">
                            <span className="badge-history">
                                {patient.numero_historia}
                            </span>
                            <span className="badge-dni">
                                <User size={14} /> DNI: {patient.documento_identidad || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleNewAttention}
                    className="btn-new-attention"
                >
                    <PlusCircle size={18} />
                    Registrar Atención
                </button>
            </div>

            {/* Contenido Principal */}
            <div className="history-section">
                <div className="history-header">
                    <h2>
                        <Activity size={20} className="text-blue-600" />
                        Historial Clínico
                        <span className="text-sm font-normal text-gray-400 ml-2">({history.length} registros)</span>
                    </h2>
                </div>

                {history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-bg">
                            <FileText size={32} className="text-gray-400" />
                        </div>
                        <h3>Sin historial registrado</h3>
                        <p>
                            Este paciente aún no tiene atenciones médicas.
                        </p>
                        <button
                            onClick={handleNewAttention}
                            className="btn-link"
                        >
                            Comenzar primera atención &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="timeline-container">
                        {history.map((item) => (
                            <div key={item.id} className="timeline-item">
                                <div
                                    className="timeline-summary"
                                    onClick={() => toggleAttention(item.id)}
                                >
                                    <div className="timeline-left">
                                        <div className="date-circle">
                                            <span className="date-day">{item.fecha_atencion ? new Date(item.fecha_atencion).getDate() : '?'}</span>
                                            <span className="date-month">{item.fecha_atencion ? new Date(item.fecha_atencion).toLocaleString('es-ES', { month: 'short' }) : '-'}</span>
                                        </div>
                                        <div className="visit-info">
                                            <h3>{item.motivo_consulta || 'Consulta General'}</h3>
                                            <div className="visit-meta">
                                                <span className="meta-item">
                                                    <Clock size={14} />
                                                    {item.hora_ingreso || 'Sin hora'}
                                                </span>
                                                <span className="meta-item">
                                                    <User size={14} />
                                                    Dr. {item.medico?.nombres || 'No asignado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`status-badge ${item.estado === 'Atendida' ? 'status-attended' :
                                                item.estado === 'Cancelada' ? 'status-cancelled' :
                                                    'status-pending'
                                            }`}>
                                            {item.estado}
                                        </span>
                                        {expandedAttention === item.id ?
                                            <ChevronUp size={20} className="text-gray-400" /> :
                                            <ChevronDown size={20} className="text-gray-400" />
                                        }
                                    </div>
                                </div>

                                {/* Detalle Expandible */}
                                {expandedAttention === item.id && (
                                    <div className="timeline-detail">
                                        <div className="detail-grid">
                                            {/* Signos Vitales */}
                                            <div className="vitals-card">
                                                <h4 className="section-title">Signos Vitales</h4>
                                                <div className="vitals-grid">
                                                    <div className="vital-item">
                                                        <span className="vital-label">Presión</span>
                                                        <span className="vital-value">{item.presion_arterial || '-'}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <span className="vital-label">Frecuencia C.</span>
                                                        <span className="vital-value">{item.frecuencia_cardiaca ? `${item.frecuencia_cardiaca} bpm` : '-'}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <span className="vital-label">Frecuencia R.</span>
                                                        <span className="vital-value">{item.frecuencia_respiratoria ? `${item.frecuencia_respiratoria} rpm` : '-'}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <span className="vital-label">Temp.</span>
                                                        <span className="vital-value">{item.temperatura ? `${item.temperatura}°C` : '-'}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <span className="vital-label">Peso</span>
                                                        <span className="vital-value">{item.peso ? `${item.peso} kg` : '-'}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <span className="vital-label">Talla</span>
                                                        <span className="vital-value">{item.talla ? `${item.talla} m` : '-'}</span>
                                                    </div>
                                                    <div className="vital-item col-span-2">
                                                        <span className="vital-label">IMC</span>
                                                        <span className="vital-value">{item.imc || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notas Clínicas */}
                                            <div className="clinical-notes">
                                                <div className="note-group">
                                                    <h4 className="section-title">Diagnóstico</h4>
                                                    <div className="note-box">
                                                        {item.diagnostico || 'No registrado'}
                                                    </div>
                                                </div>
                                                <div className="note-group">
                                                    <h4 className="section-title">Tratamiento</h4>
                                                    <div className="note-box">
                                                        {item.tratamiento || 'No registrado'}
                                                    </div>
                                                </div>
                                                {item.funciones_biologicas && (
                                                    <div className="note-group">
                                                        <h4 className="section-title">Funciones Biológicas</h4>
                                                        <div className="note-box text-italic">
                                                            {item.funciones_biologicas}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoriaClinica;
