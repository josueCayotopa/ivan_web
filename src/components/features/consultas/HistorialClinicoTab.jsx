// HistorialClinicoTab.jsx
import React, { useState, useEffect } from 'react';
import { Clock, User, ChevronRight } from 'lucide-react';
import consultaExternaService from '../../../services/consultaExternaService';

const HistorialClinicoTab = ({ pacienteId }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            const res = await consultaExternaService.getHistorialPorPaciente(pacienteId);
            if (res.success) setHistorial(res.data);
            setLoading(false);
        };
        fetchHistorial();
    }, [pacienteId]);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="form-section fade-in-right">
            <h3 className="section-title">Historial de Consultas</h3>
            <div className="historial-timeline">
                {historial.map((h) => (
                    <div key={h.id} className="historial-item">
                        <div className="historial-date">
                            <span className="day">{new Date(h.created_at).getDate()}</span>
                            <span className="month">{new Date(h.created_at).toLocaleString('es', { month: 'short' })}</span>
                            <span className="year">{new Date(h.created_at).getFullYear()}</span>
                        </div>
                        <div className="historial-content">
                            <h4>{h.procedimiento_propuesto || 'Consulta General'}</h4>
                            <div className="historial-meta">
                                <span><User size={14} /> Dr. {h.atencion?.medico?.user?.name}</span>
                                <span><Clock size={14} /> {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="historial-diag">
                                <strong>Plan:</strong> {h.tecnica_utilizar || 'No especificado'}
                            </p>
                        </div>
                        <button className="btn-icon-gallery" title="Ver detalle completo">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistorialClinicoTab;