// src/components/features/consultas/VisualizadorConsulta.jsx
import React from 'react';
import {
    Printer, X, ShieldCheck, Stethoscope, Calendar,
    UserCheck, Heart, Activity, ImageIcon, FileText
} from 'lucide-react';
import DatosGeneralesPaciente from './DatosGeneralesPaciente';
import MotivosEsteticosTab from './MotivosEsteticosTab';
import VitalesEvaluacionTab from './VitalesEvaluacionTab';
import PlanTratamientoTab from './PlanTratamientoTab';
import ImagenesVideosTab from './ImagenesVideosTab';
import './ConsultaExterna.css';
import AntecedentesTab from './AntecedentesTab';

const VisualizadorConsulta = ({ consulta, paciente, onClose }) => {
    const handlePrint = () => window.print();
    // Función para scroll suave a las secciones
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };


    return (
        <div className="consulta-container" style={{ position: 'relative', height: '100%', width: '100%', zIndex: 1 }}>
            {/* BARRA LATERAL DE NAVEGACIÓN RÁPIDA (Solo lectura) */}
            <div className="consulta-sidebar no-print" style={{ width: '80px', minWidth: '80px', padding: '20px 0' }}>
                <nav className="consulta-nav" style={{ alignItems: 'center' }}>
                    <button className="nav-item" onClick={() => scrollToSection('sec-header')} title="Inicio"><Stethoscope size={20} /></button>
                    <button className="nav-item" onClick={() => scrollToSection('sec-antecedentes')} title="Antecedentes"><Heart size={20} /></button>
                    <button className="nav-item" onClick={() => scrollToSection('sec-vitales')} title="Vitales"><Activity size={20} /></button>
                    <button className="nav-item" onClick={() => scrollToSection('sec-plan')} title="Plan"><FileText size={20} /></button>
                    <button className="nav-item" onClick={() => scrollToSection('sec-media')} title="Multimedia"><ImageIcon size={20} /></button>
                </nav>
            </div>

            <div className="consulta-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header Superior */}
                <div className="content-header no-print">
                    <div>
                        <h2><ShieldCheck size={24} color="#FFC107" /> Modo Lectura</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handlePrint} className="btn-save-consulta"><Printer size={18} /> Imprimir</button>
                        <button onClick={onClose} className="btn-back"><X size={18} /> Cerrar</button>
                    </div>
                </div>

                <div className="form-sections-container custom-scrollbar" style={{ padding: '20px 40px' }}>

                    {/* ENCABEZADO MÉDICO COMPACTO */}
                    <div id="sec-header" className="form-section" style={{ marginBottom: '15px' }}>
                        <div className="form-grid-3">
                            <div>
                                <label className="detail-label">Procedimiento</label>
                                <h4 style={{ margin: 0 }}>{consulta.procedimiento_propuesto || "General"}</h4>
                            </div>
                            <div>
                                <label className="detail-label">Fecha</label>
                                <p style={{ margin: 0 }}>{new Date(consulta.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="detail-label">Médico</label>
                                <p style={{ margin: 0 }}>{consulta.atencion?.medico?.user?.name || "Dr. Pareja"}</p>
                            </div>
                        </div>
                    </div>

                    <fieldset disabled style={{ border: 'none', padding: 0 }}>
                        {/* Datos del Paciente en una línea compacta */}
                        <div id="sec-paciente">
                            <DatosGeneralesPaciente paciente={paciente} formData={consulta} handleChange={() => { }} />
                        </div>

                        {/* Organización en Grids para reducir altura */}
                        <div className="form-grid-2" style={{ alignItems: 'start' }}>
                            <div id="sec-antecedentes">
                                <AntecedentesTab formData={consulta} p={paciente} readOnly={true} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div id="sec-vitales">
                                    <VitalesEvaluacionTab formData={consulta} handleChange={() => { }} />
                                </div>
                                <div id="sec-motivos">
                                    <MotivosEsteticosTab formData={consulta} handleChange={() => { }} />
                                </div>
                            </div>
                        </div>

                        <div id="sec-plan">
                            <PlanTratamientoTab formData={consulta} handleChange={() => { }} />
                        </div>

                        <div id="sec-media">
                            <ImagenesVideosTab consultaId={consulta.id} pacienteId={paciente.id} readOnly={true} />
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default VisualizadorConsulta;