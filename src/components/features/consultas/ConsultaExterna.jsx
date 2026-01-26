import React, { useState, useEffect, useMemo } from 'react';
import {
    User, FileText, Activity, Stethoscope, ClipboardList,
    Save, ArrowLeft, Calendar, Clock, FileClock,
    MapPin, Phone, Heart, Home, Image, Upload, Trash2, Video, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import consultaExternaService from '../../../services/consultaExternaService';
import pacienteService from '../../../services/pacienteService'; // Para el historial
import archivoService from '../../../services/archivoService'; // Nuevo servicio
import DatosGeneralesPaciente from './DatosGeneralesPaciente';
import './ConsultaExterna.css';

const ConsultaExterna = ({ atencion, onClose }) => {
    const [activeTab, setActiveTab] = useState('generales');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estados para los nuevos tabs
    const [historialPrevio, setHistorialPrevio] = useState([]);
    const [archivosPaciente, setArchivosPaciente] = useState([]);
    const [uploading, setUploading] = useState(false);

    const p = atencion?.paciente || {};

    // Estado del formulario (Mantenemos tu estructura anterior)
    const [formData, setFormData] = useState({
        id: null,
        // ... Antecedentes ...
        diabetes: false, hipertension_arterial: false, cancer: false, artritis: false,
        otros_antecedentes: '', tratamiento_actual: '', intervenciones_quirurgicas: '',
        // ... Infectocontagiosas ...
        infecciones_urinarias: false, pulmones: false, infec_gastrointestinal: false,
        enf_transmision_sexual: false, hepatitis: false, hepatitis_tipo: '', hiv: false,
        otros_enfermedades: '',
        // ... Alergias ...
        medicamentos_alergia: false, medicamentos_alergia_detalle: '',
        alimentos_alergia: false, alimentos_alergia_detalle: '', otros_alergias: '',
        // ... Hábitos ...
        tabaco: false, alcohol: false, farmacos: false,
        fecha_ultima_regla: '', regular: false, irregular: false,
        // ... Consulta ...
        anamnesis: '', tiempo_enfermedad: '', forma_inicio: 'Insidioso', curso_enfermedad: 'Progresivo',
        apetito: 'Normal', sed: 'Normal', sueno: 'Normal', orina: 'Normal', deposiciones: 'Normal',
        presion_arterial_sistolica: '', presion_arterial_diastolica: '',
        frecuencia_cardiaca: '', frecuencia_respiratoria: '', temperatura: '', saturacion: '',
        peso: '', talla: '', imc: '',
        examen_fisico_general: '', examen_regional: '',
        diagnostico_presuntivo: '', diagnostico_definitivo: '', cie10: '',
        tratamiento: '', examenes_auxiliares: '', proxima_cita: ''
    });

    useEffect(() => {
        if (atencion?.id) cargarConsulta();
    }, [atencion]);

    // Cargar historial solo cuando se entra al tab
    useEffect(() => {
        if (activeTab === 'historial' && historialPrevio.length === 0) {
            cargarHistorial();
        }
        if (activeTab === 'archivos' && archivosPaciente.length === 0) {
            cargarArchivos();
        }
    }, [activeTab]);

    const cargarConsulta = async () => {
        try {
            console.log("🔍 Buscando historia actual...");
            const response = await consultaExternaService.getByAtencionId(atencion.id);

            if (response.success && response.data) {
                // CASO A: EDICIÓN (Ya guardó datos para ESTA cita)
                console.log("✅ Historia encontrada (Edición).");
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    // Mapeos específicos
                    presion_arterial_sistolica: data.presion_arterial?.split('/')[0] || '',
                    presion_arterial_diastolica: data.presion_arterial?.split('/')[1] || '',
                    diagnostico_presuntivo: data.diagnostico || '',
                    // Asegurar booleanos
                    diabetes: !!data.diabetes,
                    hipertension_arterial: !!data.hipertension_arterial,
                    cancer: !!data.cancer,
                    // ... resto de booleanos ...
                }));
            } else {
                // CASO B: NUEVA CONSULTA -> Intentamos copiar antecedentes anteriores
                console.log("ℹ️ Nueva Consulta. Buscando antecedentes previos...");

                // 1. Cargamos datos básicos del paciente (Teléfono, Ocupación actual)
                setFormData(prev => ({
                    ...prev,
                    id: null, // Importante: ID null para que cree una nueva
                    telefono_consulta: p.telefono || p.celular || '',
                    direccion_consulta: p.direccion || '',
                    ocupacion_actual: p.ocupacion || '',
                    email_contacto: p.email || '',
                }));

                // 2. BUSCAMOS LA ÚLTIMA HISTORIA DEL PACIENTE
                try {
                    const historialRes = await consultaExternaService.getHistorialPaciente(p.id);
                    // Si hay historial y tiene datos
                    if (historialRes.success && historialRes.data && historialRes.data.length > 0) {
                        const ultimaConsulta = historialRes.data[0]; // La más reciente (asumiendo orden DESC)

                        console.log("🔄 Copiando antecedentes de la fecha:", ultimaConsulta.created_at);

                        setFormData(prev => ({
                            ...prev,
                            // --- COPIAMOS SOLO ANTECEDENTES (NO EL DIAGNÓSTICO DE HOY) ---
                            // Clínicos
                            diabetes: !!ultimaConsulta.diabetes,
                            hipertension_arterial: !!ultimaConsulta.hipertension_arterial,
                            cancer: !!ultimaConsulta.cancer,
                            artritis: !!ultimaConsulta.artritis,
                            otros_antecedentes: ultimaConsulta.otros_antecedentes || '',
                            tratamiento_actual: ultimaConsulta.tratamiento_actual || '', // Medicación crónica
                            intervenciones_quirurgicas: ultimaConsulta.intervenciones_quirurgicas || '',

                            // Infecciosos
                            infecciones_urinarias: !!ultimaConsulta.infecciones_urinarias,
                            pulmones: !!ultimaConsulta.pulmones,
                            infec_gastrointestinal: !!ultimaConsulta.infec_gastrointestinal,
                            enf_transmision_sexual: !!ultimaConsulta.enf_transmision_sexual,
                            hepatitis: !!ultimaConsulta.hepatitis,
                            hepatitis_tipo: ultimaConsulta.hepatitis_tipo || '',
                            hiv: !!ultimaConsulta.hiv,

                            // Alergias
                            medicamentos_alergia: !!ultimaConsulta.medicamentos_alergia,
                            medicamentos_alergia_detalle: ultimaConsulta.medicamentos_alergia_detalle || '',
                            alimentos_alergia: !!ultimaConsulta.alimentos_alergia,
                            alimentos_alergia_detalle: ultimaConsulta.alimentos_alergia_detalle || '',

                            // Hábitos
                            tabaco: !!ultimaConsulta.tabaco,
                            alcohol: !!ultimaConsulta.alcohol,
                            farmacos: !!ultimaConsulta.farmacos,

                            // Fisiológicos (Últimos registrados)
                            fecha_ultima_regla: ultimaConsulta.fecha_ultima_regla || '',
                            regular: !!ultimaConsulta.regular,
                            irregular: !!ultimaConsulta.irregular,
                        }));

                        Swal.fire({
                            icon: 'info',
                            title: 'Antecedentes cargados',
                            text: 'Se han precargado los antecedentes de la última visita del paciente.',
                            toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
                        });
                    }
                } catch (errHist) {
                    console.log("No hay historial previo para copiar.");
                }
            }
        } catch (error) {
            console.warn("Error de carga controlado.");
        } finally {
            // Pequeño delay para evitar parpadeos de React
            setTimeout(() => setLoading(false), 100);
        }
    };

    const cargarHistorial = async () => {
        try {
            const res = await pacienteService.getHistorial(p.id);
            if (res.success) setHistorialPrevio(res.data.atenciones || []);
        } catch (error) { console.error(error); }
    };

    const cargarArchivos = async () => {
        try {
            // Cargamos archivos asociados al PACIENTE para ver todo su historial visual
            // Asegúrate de enviar el modelo correcto que usas en backend (ej: 'App\Models\Pacientes')
            const res = await archivoService.getArchivos('Pacientes', p.id);
            if (res.success) setArchivosPaciente(res.data);
        } catch (error) { console.error(error); }
    };

    // Subir Archivo
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const payload = {
            adjuntable_type: 'Pacientes', // O 'ConsultaExterna' si prefieres ligarlo a la consulta
            adjuntable_id: p.id,
            categoria: 'galeria',
            file: file
        };

        const res = await archivoService.subirArchivo(payload);
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Archivo subido', timer: 1500, showConfirmButton: false });
            cargarArchivos(); // Recargar galería
        } else {
            Swal.fire('Error', res.message || 'No se pudo subir', 'error');
        }
        setUploading(false);
    };

    // Eliminar Archivo
    const handleFileDelete = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar archivo?',
            text: "No podrás recuperarlo",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar'
        });

        if (confirm.isConfirmed) {
            await archivoService.eliminarArchivo(id);
            setArchivosPaciente(prev => prev.filter(f => f.id !== id));
        }
    };

    // ... (Cálculo IMC y HandleSubmit se mantienen igual que tu versión anterior) ...
    useMemo(() => {
        const pesoNum = parseFloat(formData.peso);
        const tallaNum = parseFloat(formData.talla);
        if (pesoNum > 0 && tallaNum > 0) {
            const imcValue = (pesoNum / (tallaNum * tallaNum)).toFixed(2);
            setFormData(prev => ({ ...prev, imc: imcValue }));
        }
    }, [formData.peso, formData.talla]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                atencion_id: atencion.id, paciente_id: atencion.paciente_id, medico_id: atencion.medico_id,
                ...formData,
                presion_arterial: `${formData.presion_arterial_sistolica}/${formData.presion_arterial_diastolica}`,
                telefono_consulta: p.telefono, direccion_consulta: p.direccion, ocupacion_actual: p.ocupacion
            };
            const response = await consultaExternaService.save(payload, formData.id);
            if (response.success) {
                if (response.data?.id) setFormData(prev => ({ ...prev, id: response.data.id }));
                Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
            } else { Swal.fire('Error', response.message, 'error'); }
        } catch (error) { Swal.fire('Error', 'Error de conexión', 'error'); }
        finally { setSaving(false); }
    };

    const tabs = [
        { id: 'generales', label: 'Datos Generales', icon: <User size={18} /> },
        { id: 'antecedentes', label: 'Antecedentes', icon: <FileClock size={18} /> },

        { id: 'anamnesis', label: 'Anamnesis', icon: <FileText size={18} /> },
        { id: 'vitales', label: 'Vitales', icon: <Activity size={18} /> },
        { id: 'fisico', label: 'Examen Físico', icon: <Stethoscope size={18} /> },
        { id: 'diagnostico', label: 'Diagnóstico', icon: <ClipboardList size={18} /> },
        { id: 'historial', label: 'Historial Médico', icon: <Activity size={18} /> }, // <--- NUEVO
        { id: 'archivos', label: 'Galería / Archivos', icon: <Image size={18} /> },   // <--- NUEVO
    ];

    if (loading) return <div className="consulta-loading"><div className="spinner"></div> Cargando...</div>;

    return (
        <div className="consulta-container fade-in">
            {/* SIDEBAR */}
            <div className="consulta-sidebar custom-scrollbar">
                <div className="paciente-resumen-card">
                    <div className="paciente-header-row">
                        <div className="paciente-avatar"><User size={24} /></div>
                        <div className="paciente-main-info">
                            <h4>{p.nombres}</h4>
                            <h4 style={{ fontWeight: 400, fontSize: '0.9rem' }}>{p.apellido_paterno}</h4>
                        </div>
                    </div>
                    <div className="paciente-badges">
                        <span className="info-badge">HC: {p.numero_historia}</span>
                        <span className="info-badge">{p.edad} años</span>
                    </div>
                </div>
                <nav className="consulta-nav">
                    {tabs.map(tab => (
                        <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.icon} <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-actions">
                    <button className="btn-back" onClick={onClose}><ArrowLeft size={18} /> Salir</button>
                    <button className="btn-save-consulta" onClick={handleSubmit} disabled={saving}>
                        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="consulta-content">
                <div className="content-header">
                    <div>
                        <h2>Consulta Externa</h2>
                        <div className="atencion-meta">
                            <span><Calendar size={14} /> {atencion?.fecha_atencion ? new Date(atencion.fecha_atencion).toLocaleDateString() : ''}</span>
                            <span className="tipo-tag">{atencion?.tipo_atencion}</span>
                        </div>
                    </div>
                </div>

                <div className="form-sections-container custom-scrollbar">

                    {/* TAB 1: DATOS GENERALES */}
                    {activeTab === 'generales' && (
                        <div className="fade-in-right">
                            <DatosGeneralesPaciente paciente={p} atencion={atencion} />
                            <div className="form-section">
                                <h3 className="section-title">Observaciones de Admisión</h3>
                                <textarea className="input-readonly" disabled value={atencion.motivo_consulta || 'Ninguna'} rows="2" />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ANTECEDENTES (Checkboxes) */}
                    {activeTab === 'antecedentes' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Antecedentes Clínicos</h3>
                            <div className="checkbox-grid-4">
                                <label className="checkbox-card"><input type="checkbox" name="diabetes" checked={!!formData.diabetes} onChange={handleChange} /> <span>Diabetes</span></label>
                                <label className="checkbox-card"><input type="checkbox" name="hipertension_arterial" checked={!!formData.hipertension_arterial} onChange={handleChange} /> <span>Hipertensión</span></label>
                                <label className="checkbox-card"><input type="checkbox" name="cancer" checked={!!formData.cancer} onChange={handleChange} /> <span>Cáncer</span></label>
                                <label className="checkbox-card"><input type="checkbox" name="artritis" checked={!!formData.artritis} onChange={handleChange} /> <span>Artritis</span></label>
                            </div>

                            <div className="form-group full-width" style={{ marginTop: 15 }}>
                                <label>Otros Antecedentes / Detalle</label>
                                <input name="otros_antecedentes" value={formData.otros_antecedentes} onChange={handleChange} />
                            </div>

                            <div className="form-grid-2" style={{ marginTop: 20 }}>
                                <div className="form-group">
                                    <label>Tratamiento Actual</label>
                                    <textarea name="tratamiento_actual" value={formData.tratamiento_actual} onChange={handleChange} rows="2" />
                                </div>
                                <div className="form-group">
                                    <label>Intervenciones Quirúrgicas</label>
                                    <textarea name="intervenciones_quirurgicas" value={formData.intervenciones_quirurgicas} onChange={handleChange} rows="2" />
                                </div>
                            </div>

                            <div className="divider-dashed"></div>

                            <h3 className="section-title">Infectocontagiosas y Alergias</h3>
                            <div className="form-grid-3">
                                <div>
                                    <label className="checkbox-inline"><input type="checkbox" name="infecciones_urinarias" checked={!!formData.infecciones_urinarias} onChange={handleChange} /> Inf. Urinarias</label>
                                    <label className="checkbox-inline"><input type="checkbox" name="pulmones" checked={!!formData.pulmones} onChange={handleChange} /> Pulmones (TBC)</label>
                                    <label className="checkbox-inline"><input type="checkbox" name="infec_gastrointestinal" checked={!!formData.infec_gastrointestinal} onChange={handleChange} /> Gastrointestinal</label>
                                </div>
                                <div>
                                    <label className="checkbox-inline"><input type="checkbox" name="hepatitis" checked={!!formData.hepatitis} onChange={handleChange} /> Hepatitis</label>
                                    <label className="checkbox-inline"><input type="checkbox" name="hiv" checked={!!formData.hiv} onChange={handleChange} /> HIV / ETS</label>
                                </div>
                                <div>
                                    <div className="form-group">
                                        <label>Alergia Medicamentos</label>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <input type="checkbox" name="medicamentos_alergia" checked={!!formData.medicamentos_alergia} onChange={handleChange} style={{ width: 20 }} />
                                            <input name="medicamentos_alergia_detalle" value={formData.medicamentos_alergia_detalle} onChange={handleChange} placeholder="¿Cuál?" disabled={!formData.medicamentos_alergia} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN FISIOLÓGICOS (Solo mujeres o general) */}
                            <h3 className="section-title">Fisiológicos</h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Fecha de Última Regla (FUR)</label>
                                    <input
                                        type="date"
                                        name="fecha_ultima_regla"
                                        value={formData.fecha_ultima_regla}
                                        onChange={handleChange}
                                        style={{ maxWidth: '200px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Regularidad</label>
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                        <label className="checkbox-inline">
                                            <input
                                                type="radio" // Usamos radio para que sea uno u otro
                                                name="tipo_regla" // Nombre temporal para el grupo
                                                checked={formData.regular}
                                                onChange={() => setFormData({ ...formData, regular: true, irregular: false })}
                                            />
                                            Regular
                                        </label>
                                        <label className="checkbox-inline">
                                            <input
                                                type="radio"
                                                name="tipo_regla"
                                                checked={formData.irregular}
                                                onChange={() => setFormData({ ...formData, regular: false, irregular: true })}
                                            />
                                            Irregular
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="divider-dashed"></div>

                            <h3 className="section-title">Hábitos Nocivos</h3>
                            <div className="checkbox-grid-3">
                                <label className="checkbox-card"><input type="checkbox" name="tabaco" checked={!!formData.tabaco} onChange={handleChange} /> <span>Tabaco</span></label>
                                <label className="checkbox-card"><input type="checkbox" name="alcohol" checked={!!formData.alcohol} onChange={handleChange} /> <span>Alcohol</span></label>
                                <label className="checkbox-card"><input type="checkbox" name="farmacos" checked={!!formData.farmacos} onChange={handleChange} /> <span>Drogas/Fármacos</span></label>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ANAMNESIS */}
                    {activeTab === 'anamnesis' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Anamnesis</h3>
                            <div className="form-group full-width">
                                <label>Relato / Motivo de Consulta</label>
                                <textarea name="anamnesis" value={formData.anamnesis} onChange={handleChange} rows="6" placeholder="Describa el cuadro..." />
                            </div>
                            <div className="form-grid-3">
                                <div className="form-group"><label>Tiempo Enf.</label><input name="tiempo_enfermedad" value={formData.tiempo_enfermedad} onChange={handleChange} /></div>
                                <div className="form-group"><label>Inicio</label><select name="forma_inicio" value={formData.forma_inicio} onChange={handleChange}><option>Insidioso</option><option>Brusco</option></select></div>
                                <div className="form-group"><label>Curso</label><select name="curso_enfermedad" value={formData.curso_enfermedad} onChange={handleChange}><option>Progresivo</option><option>Estacionario</option></select></div>
                            </div>
                            <h4 className="subsection-title">Funciones Biológicas</h4>
                            <div className="form-grid-5-small">
                                {['Apetito', 'Sed', 'Sueño', 'Orina', 'Deposiciones'].map(f => (
                                    <div className="form-group" key={f}><label>{f}</label><select name={f.toLowerCase()} value={formData[f.toLowerCase()]} onChange={handleChange}><option>Normal</option><option>Alterado</option></select></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: VITALES */}
                    {activeTab === 'vitales' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Signos Vitales</h3>
                            <div className="vital-signs-grid">
                                <div className="vital-card">
                                    <label>P.A.</label>
                                    <div className="pa-inputs">
                                        <input name="presion_arterial_sistolica" value={formData.presion_arterial_sistolica} onChange={handleChange} placeholder="120" />
                                        <span>/</span>
                                        <input name="presion_arterial_diastolica" value={formData.presion_arterial_diastolica} onChange={handleChange} placeholder="80" />
                                    </div>
                                </div>
                                <div className="vital-card"><label>FC (lpm)</label><input name="frecuencia_cardiaca" value={formData.frecuencia_cardiaca} onChange={handleChange} /></div>
                                <div className="vital-card"><label>FR (rpm)</label><input name="frecuencia_respiratoria" value={formData.frecuencia_respiratoria} onChange={handleChange} /></div>
                                <div className="vital-card"><label>Temp (°C)</label><input name="temperatura" value={formData.temperatura} onChange={handleChange} /></div>
                                <div className="vital-card orange-border"><label>Peso (kg)</label><input name="peso" value={formData.peso} onChange={handleChange} /></div>
                                <div className="vital-card orange-border"><label>Talla (m)</label><input name="talla" value={formData.talla} onChange={handleChange} /></div>
                                <div className="vital-card imc-card"><label>IMC</label><div className="imc-value">{formData.imc || '--'}</div></div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: EXAMEN FÍSICO */}
                    {activeTab === 'fisico' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Examen Físico</h3>
                            <div className="form-group full-width"><label>Examen General</label><textarea name="examen_fisico_general" value={formData.examen_fisico_general} onChange={handleChange} rows="4" /></div>
                            <div className="form-group full-width"><label>Examen Regional</label><textarea name="examen_regional" value={formData.examen_regional} onChange={handleChange} rows="6" /></div>
                        </div>
                    )}

                    {/* TAB 6: DIAGNÓSTICO */}
                    {activeTab === 'diagnostico' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Diagnóstico y Plan</h3>
                            <div className="form-grid-2">
                                <div className="form-group"><label>Diagnóstico Presuntivo</label><textarea name="diagnostico_presuntivo" value={formData.diagnostico_presuntivo} onChange={handleChange} rows="3" /></div>
                                <div className="form-group"><label>Diagnóstico (CIE-10)</label><textarea name="diagnostico_definitivo" value={formData.diagnostico_definitivo} onChange={handleChange} rows="3" /></div>
                            </div>
                            <div className="form-group full-width" style={{ marginTop: 20 }}>
                                <label>Tratamiento / Indicaciones</label>
                                <textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange} rows="6" className="treatment-textarea" />
                            </div>
                            <div className="form-grid-2" style={{ marginTop: 20 }}>
                                <div className="form-group"><label>Exámenes Auxiliares</label><textarea name="examenes_auxiliares" value={formData.examenes_auxiliares} onChange={handleChange} rows="3" /></div>
                                <div className="form-group"><label>Próxima Cita</label><input type="date" name="proxima_cita" value={formData.proxima_cita} onChange={handleChange} /></div>
                            </div>
                        </div>
                    )}

                    {/* --- NUEVO TAB 7: HISTORIAL MÉDICO --- */}
                    {activeTab === 'historial' && (
                        <div className="form-section fade-in-right">
                            <h3 className="section-title">Historial de Atenciones</h3>
                            {historialPrevio.length === 0 ? (
                                <p className="text-gray-500">No hay atenciones previas registradas.</p>
                            ) : (
                                <div className="historial-timeline">
                                    {historialPrevio.map(h => (
                                        <div key={h.id} className="historial-item">
                                            <div className="historial-date">
                                                <span className="day">{new Date(h.fecha_atencion).getDate()}</span>
                                                <span className="month">{new Date(h.fecha_atencion).toLocaleString('es-ES', { month: 'short' })}</span>
                                                <span className="year">{new Date(h.fecha_atencion).getFullYear()}</span>
                                            </div>
                                            <div className="historial-content">
                                                <h4>{h.motivo_consulta || 'Consulta General'}</h4>
                                                <div className="historial-meta">
                                                    <span><User size={14} /> Dr. {h.medico?.nombres}</span>
                                                    <span className={`status-badge status-${h.estado.toLowerCase()}`}>{h.estado}</span>
                                                </div>
                                                {h.diagnostico && (
                                                    <p className="historial-diag"><strong>Dx:</strong> {h.diagnostico}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- NUEVO TAB 8: GALERÍA / ARCHIVOS --- */}
                    {activeTab === 'archivos' && (
                        <div className="form-section fade-in-right">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 className="section-title" style={{ margin: 0 }}>Galería Multimedia</h3>
                                <label className="btn-upload">
                                    {uploading ? 'Subiendo...' : <><Upload size={18} /> Subir Archivo</>}
                                    <input type="file" hidden onChange={handleFileUpload} accept="image/*,video/*" disabled={uploading} />
                                </label>
                            </div>

                            {archivosPaciente.length === 0 ? (
                                <div className="empty-gallery">
                                    <Image size={48} color="#D1D5DB" />
                                    <p>No hay fotos ni videos cargados.</p>
                                </div>
                            ) : (
                                <div className="gallery-grid">
                                    {archivosPaciente.map(archivo => (
                                        <div key={archivo.id} className="gallery-item">
                                            {archivo.tipo_mime?.startsWith('video') ? (
                                                <div className="video-thumbnail"><Video size={32} /></div>
                                            ) : (
                                                <img src={archivo.ruta_archivo || archivo.url} alt="Archivo" loading="lazy" />
                                            )}

                                            <div className="gallery-overlay">
                                                <button className="btn-icon-gallery" title="Ver"><Eye size={16} /></button>
                                                <button className="btn-icon-gallery delete" onClick={() => handleFileDelete(archivo.id)} title="Eliminar"><Trash2 size={16} /></button>
                                            </div>
                                            <span className="gallery-date">{new Date(archivo.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default ConsultaExterna;