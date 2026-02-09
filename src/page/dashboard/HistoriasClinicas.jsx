import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, ArrowLeft } from 'lucide-react';
import pacienteService from '../../services/pacienteService';
import consultaExternaService from '../../services/consultaExternaService';
import VisualizadorConsulta from '../../components/features/consultas/VisualizadorHistoriaClinica'; // <-- Importar
import './Pacientes.css';
const HistoriasClinicas = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    // NUEVO ESTADO PARA EL DETALLE
    const [consultaParaVer, setConsultaParaVer] = useState(null);

    const buscarPacientes = async () => {
        setLoading(true);
        try {
            const response = await pacienteService.getPacientes(1, searchTerm);
            if (response.success) setPacientes(response.data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally { setLoading(false); }
    };

    const verHistorial = async (paciente) => {
        setSelectedPaciente(paciente);
        setLoadingHistorial(true);
        try {
            const response = await consultaExternaService.getHistorialPorPaciente(paciente.id);
            setHistorial(response.data || response || []);
        } catch (error) {
            console.error("Error al cargar historial:", error);
        } finally { setLoadingHistorial(false); }
    };

    // Si hay una consulta seleccionada, mostrar el visualizador
    if (consultaParaVer) {
        return (
            <VisualizadorConsulta
                consulta={consultaParaVer}
                paciente={selectedPaciente}
                onClose={() => setConsultaParaVer(null)}
            />
        );
    }

    return (
        <div className="pacientes-container fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Búsqueda de Historias Clínicas</h2>
                    <p className="page-subtitle">Consulte el expediente histórico de los pacientes</p>
                </div>
            </div>

            {!selectedPaciente ? (
                <>
                    {/* Buscador similar al de Pacientes.jsx */}
                    <div className="filters-card">
                        <div className="filters-row">
                            <div className="search-box" style={{ flex: 1 }}>
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por nombre o DNI..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && buscarPacientes()}
                                    className="search-input"
                                />
                            </div>
                            <button className="btn-search" onClick={buscarPacientes}>Buscar</button>
                        </div>
                    </div>

                    <div className="table-card">
                        <table className="patients-table">
                            <thead>
                                <tr>
                                    <th>H.C.</th>
                                    <th>Paciente</th>
                                    <th>Documento</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.map(p => (
                                    <tr key={p.id}>
                                        <td><span className="historia-badge">{p.numero_historia}</span></td>
                                        <td>{p.nombres} {p.apellido_paterno}</td>
                                        <td>{p.documento_identidad}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => verHistorial(p)} title="Ver Historial">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="historial-detalle fade-in">
                    <button className="btn-cancel" onClick={() => setSelectedPaciente(null)} style={{ marginBottom: '20px' }}>
                        <ArrowLeft size={16} /> Volver a la búsqueda
                    </button>

                    {/* Tarjeta de identificación del paciente */}
                    <div className="detail-header" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #F3F4F6', marginBottom: '30px' }}>
                        <div className="patient-avatar-large">
                            {selectedPaciente.nombres?.charAt(0)}{selectedPaciente.apellido_paterno?.charAt(0)}
                        </div>
                        <div>
                            <h3>{selectedPaciente.nombres} {selectedPaciente.apellido_paterno}</h3>
                            <span className="historia-badge">Expediente: {selectedPaciente.numero_historia}</span>
                        </div>
                    </div>

                    <div className="timeline">
                        {loadingHistorial ? <div className="spinner"></div> :
                            historial.length > 0 ? historial.map((consulta, index) => (
                                <div key={index} className="stat-card" style={{ marginBottom: '15px', borderLeft: '4px solid #FFC107', cursor: 'pointer' }}
                                    onClick={() => setConsultaParaVer(consulta)}> {/* ACCIÓN AL HACER CLIC */}
                                    <div className="stat-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <p className="stat-label"><Calendar size={14} /> {new Date(consulta.created_at || consulta.fecha).toLocaleDateString()}</p>
                                            <span className="status-badge active">Ver Detalle Completo</span>
                                        </div>
                                        <h4 style={{ margin: '10px 0' }}>{consulta.procedimiento_propuesto || 'Consulta Externa'}</h4>
                                        <p className="detail-text" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {consulta.motivo_facial || consulta.motivo_corporal || 'Sin notas descriptivas principales.'}
                                        </p>
                                    </div>
                                </div>
                            )) : <p>No hay registros previos para este paciente.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriasClinicas;