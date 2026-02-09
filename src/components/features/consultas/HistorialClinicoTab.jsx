// HistorialClinicoTab.jsx
import React, { useState, useEffect } from 'react';
import { Clock, User, ChevronRight } from 'lucide-react';
import consultaExternaService from '../../../services/consultaExternaService';

const HistorialClinicoTab = ({ pacienteId, onVerDetalle }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            const res = await consultaExternaService.getHistorialPorPaciente(pacienteId);
            // El JSON muestra que los datos están en res.data
            if (res.success && Array.isArray(res.data)) {
                setHistorial(res.data);
            } else if (Array.isArray(res)) {
                // Caso alternativo si el service ya filtró .data
                setHistorial(res);
            }
            setLoading(false);
        };
        fetchHistorial();
    }, [pacienteId]);

    if (loading) return <div className="loading-section"><div className="spinner"></div></div>;

    return (
        <div className="form-section fade-in-right">
            <h3 className="section-title">Historial de Consultas Anteriores</h3>
            <div className="historial-timeline">
                {historial.length > 0 ? historial.map((h) => (
                    <div key={h.id} className="historial-item">
                        <div className="historial-date">
                            <span className="day">{new Date(h.created_at).getDate()}</span>
                            <span className="month">{new Date(h.created_at).toLocaleString('es', { month: 'short' })}</span>
                            <span className="year">{new Date(h.created_at).getFullYear()}</span>
                        </div>
                        <div className="historial-content">
                            {/* Ajuste según tu JSON: procedimiento_propuesto */}
                            <h4>{h.procedimiento_propuesto || 'Consulta General'}</h4>
                            <div className="historial-meta">
                                {/* Nota: En tu JSON medico_id es null, pero atencion existe */}
                                <span><User size={14} /> Atención: {h.atencion?.numero_atencion}</span>
                                <span><Clock size={14} /> {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="historial-diag">
                                <strong>Técnica:</strong> {h.tecnica_utilizar || 'Sin técnica especificada'}
                            </p>
                        </div>
                        <button
                            className="btn-icon-gallery"
                            title="Ver detalle completo"
                            onClick={() => onVerDetalle(h)} // <--- Esto envía los datos al estado de ConsultaExterna
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )) : <p className="empty-state">No se encontraron registros anteriores para este paciente.</p>}
            </div>
        </div>
    );
};

export default HistorialClinicoTab;