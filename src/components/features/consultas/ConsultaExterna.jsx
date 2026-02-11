// ConsultaExterna.jsx - OPTIMIZADO PARA CIRUGÍA ESTÉTICA
import React, { useState, useEffect } from 'react';
import {
    User, FileText, Activity, Stethoscope, ClipboardList,
    Save, ArrowLeft, Heart, DollarSign, FileSignature, AlertCircle,
    X, Image as ImageIcon, Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import consultaExternaService from '../../../services/consultaExternaService';
import DatosGeneralesPaciente from './DatosGeneralesPaciente';
import MotivosEsteticosTab from './MotivosEsteticosTab';
import VitalesEvaluacionTab from './VitalesEvaluacionTab';
import PlanTratamientoTab from './PlanTratamientoTab';
import ImagenesVideosTab from './ImagenesVideosTab';
import HistorialClinicoTab from './HistorialClinicoTab';
import VisualizadorConsulta from './VisualizadorHistoriaClinica';
import './ConsultaExterna.css';

const ConsultaExterna = ({ atencion, onClose }) => {
    const [activeTab, setActiveTab] = useState('antecedentes');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [consultaSeleccionadaHistorial, setConsultaSeleccionadaHistorial] = useState(null);

    const p = atencion?.paciente || {};

    // ==================== ESTADO DEL FORMULARIO ====================
    const [formData, setFormData] = useState({
        id: null,
        atencion_id: atencion?.id || null,
        cantidad_hijos: '',
        ultimo_embarazo: '',
        estado_civil: '',
        diabetes: false,
        hipertension_arterial: false,
        cancer: false,
        artritis: false,
        otros_antecedentes: '',
        tratamiento_actual: '',
        intervenciones_quirurgicas: '',
        infecciones_urinarias: false,
        pulmones: false,
        infec_gastrointestinal: false,
        enf_transmision_sexual: false,
        hepatitis: false,
        hiv: false,
        otros_enfermedades: '',
        medicamentos_alergia: false,
        medicamentos_alergia_detalle: '',
        alimentos_alergia: false,
        alimentos_alergia_detalle: '',
        otros_alergias: '',
        fecha_ultima_regla: '',
        regular: false,
        irregular: false,
        tabaco: false,
        alcohol: false,
        farmacos: false,
        referencia_otro: '',
        motivos_zonas: '',
        motivos_tratamientos_previos: '',
        expectativa_paciente: '',
        motivo_facial: '',
        motivo_corporal: '',
        motivo_capilar: '',
        otros_motivos: '',
        presion_arterial_sistolica: '',
        presion_arterial_diastolica: '',
        frecuencia_cardiaca: '',
        peso: '',
        talla: '',
        imc: '',
        evaluacion_zona: '',
        procedimiento_propuesto: '',
        tecnica_utilizar: '',
        productos_usar: '',
        numero_sesiones: 1,
        precio_estimado: '',
        proxima_cita: '',
        indicaciones_pre: '',
        indicaciones_post: '',
        ficha_completada: false
    });

    // ==================== EFFECTS ====================

    useEffect(() => {
        if (atencion?.id) cargarConsulta();
    }, [atencion]);

    useEffect(() => {
        if (formData.peso && formData.talla) {
            const imc = consultaExternaService.calcularIMCLocal(
                parseFloat(formData.peso),
                parseFloat(formData.talla)
            );
            if (imc) setFormData(prev => ({ ...prev, imc }));
        }
    }, [formData.peso, formData.talla]);

    // ==================== LÓGICA DE CARGA EN CASCADA ====================

    const cargarConsulta = async () => {
        if (!atencion?.id || !p?.id) return;
        setLoading(true);

        try {
            // 1. Intentar cargar la consulta de HOY
            const response = await consultaExternaService.getByAtencionId(atencion.id);

            if (response.success && response.data) {
                console.log('✅ Modo Edición: Cargando consulta actual');
                actualizarEstadoConData(response.data, false);
            } else {
                // 2. Si no hay hoy, buscar la ÚLTIMA consulta histórica del paciente
                console.log('✨ Modo Creación: Buscando última consulta histórica');
                const resUltima = await consultaExternaService.getUltimaConsulta(p.id);

                if (resUltima.success && resUltima.data) {
                    actualizarEstadoConData(resUltima.data, true);
                    Swal.fire({
                        icon: 'info',
                        title: 'Datos recuperados',
                        text: 'Se han clonado los antecedentes y motivos de la última consulta.',
                        toast: true,
                        position: 'top-end',
                        timer: 3000,
                        showConfirmButton: false
                    });
                } else {
                    inicializarFormularioNuevo();
                }
            }
        } catch (error) {
            console.error("❌ Error en carga:", error);
        } finally {
            setLoading(false);
        }
    };

    const actualizarEstadoConData = (data, esPreCarga = false) => {
        const { sistolica, diastolica } = consultaExternaService.parsearPresion(data.presion_arterial || '');

        setFormData(prev => ({
            ...prev,
            id: esPreCarga ? null : data.id,
            atencion_id: atencion.id,

            // --- CONVERSIÓN DE ENTEROS (0/1) A BOOLEANOS (true/false) ---
            // Antecedentes
            diabetes: Boolean(data.diabetes),
            hipertension_arterial: Boolean(data.hipertension_arterial),
            cancer: Boolean(data.cancer),
            artritis: Boolean(data.artritis),

            // Infectocontagiosas
            infecciones_urinarias: Boolean(data.infecciones_urinarias),
            pulmones: Boolean(data.pulmones),
            infec_gastrointestinal: Boolean(data.infec_gastrointestinal),
            enf_transmision_sexual: Boolean(data.enf_transmision_sexual),
            hepatitis: Boolean(data.hepatitis),
            hiv: Boolean(data.hiv),

            // Alergias
            medicamentos_alergia: Boolean(data.medicamentos_alergia),
            alimentos_alergia: Boolean(data.alimentos_alergia),

            // Hábitos
            tabaco: Boolean(data.tabaco),
            alcohol: Boolean(data.alcohol),
            farmacos: Boolean(data.farmacos),

            // Fisiológicos (Mujeres)
            regular: Boolean(data.regular),
            irregular: Boolean(data.irregular),

            // Marketing
            instagram_dr_ivan_pareja: Boolean(data.instagram_dr_ivan_pareja),
            facebook_dr_ivan_pareja: Boolean(data.facebook_dr_ivan_pareja),
            radio: Boolean(data.radio),
            tv: Boolean(data.tv),
            internet: Boolean(data.internet),

            // --- CAMPOS DE TEXTO (Se mantienen igual) ---
            otros_antecedentes: data.otros_antecedentes || '',
            tratamiento_actual: data.tratamiento_actual || '',
            intervenciones_quirurgicas: data.intervenciones_quirurgicas || '',
            medicamentos_alergia_detalle: data.medicamentos_alergia_detalle || '',
            alimentos_alergia_detalle: data.alimentos_alergia_detalle || '',
            motivo_facial: data.motivo_facial || '',
            motivo_corporal: data.motivo_corporal || '',
            motivo_capilar: data.motivo_capilar || '',
            expectativa_paciente: data.expectativa_paciente || '',
            motivos_zonas: data.motivos_zonas || '',
            procedimiento_propuesto: data.procedimiento_propuesto || '',

            // Vitales
            peso: data.peso || '',
            talla: data.talla || '',
            imc: data.imc || '',
            presion_arterial_sistolica: esPreCarga ? '' : sistolica,
            presion_arterial_diastolica: esPreCarga ? '' : diastolica,
            frecuencia_cardiaca: esPreCarga ? '' : (data.frecuencia_cardiaca || ''),

            referencia_otro: data.referencia_otro || atencion.medio_captacion || '',



            //  plan y tratamiento 
            procedimiento_propuesto: data.procedimiento_propuesto || '',
            tecnica_utilizar: data.tecnica_utilizar || '',
            productos_usar: data.productos_usar || '',
            numero_sesiones: data.numero_sesiones || 1,
            precio_estimado: data.precio_estimado || '', // <--- Mapear monto
            proxima_cita: data.proxima_cita || '',
        }));
    };
    const inicializarFormularioNuevo = () => {
        setFormData(prev => ({
            ...prev,
            id: null,
            atencion_id: atencion.id,
            estado_civil: p.estado_civil || '',
            referencia_otro: atencion.medio_captacion || ''
        }));
    };

    // ==================== ACCIONES ====================

    const handleSubmit = async () => {
        if (!formData.procedimiento_propuesto?.trim()) {
            Swal.fire({ icon: 'warning', title: 'Requerido', text: 'Especifique el procedimiento propuesto' });
            return;
        }

        setSaving(true);
        try {
            const presion_arterial = consultaExternaService.formatearPresion(
                formData.presion_arterial_sistolica,
                formData.presion_arterial_diastolica
            );

            const payload = { ...formData, presion_arterial };
            const response = await consultaExternaService.save(payload, formData.id);

            if (response.success || response.id) {
                const nuevoId = response.data?.id || response.id;
                if (!formData.id) setFormData(prev => ({ ...prev, id: nuevoId }));

                await Swal.fire({ icon: 'success', title: 'Guardado', timer: 2000, showConfirmButton: false });
                onClose();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la consulta' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleCheckboxChange = (field) => setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    const estaListaParaCirugia = () => consultaExternaService.estaListaParaCirugia(formData);

    // ==================== RENDER ====================

    if (loading) return (
        <div className="consulta-loading">
            <div className="spinner"></div>
            <p>Sincronizando historia clínica...</p>
        </div>
    );

    return (
        <div className="consulta-container">
            {/* SIDEBAR IZQUIERDO */}
            <div className="consulta-sidebar custom-scrollbar">
                {/* Resumen del Paciente */}
                <div className="paciente-resumen-card">
                    <div className="paciente-header-row">
                        <div className="paciente-avatar">
                            <User size={28} />
                        </div>
                        <div className="paciente-main-info">
                            <h4>{p.nombres} {p.apellido_paterno}</h4>
                        </div>
                    </div>

                    <div className="paciente-badges">
                        <span className="info-badge">{p.edad || 'N/A'} años</span>
                        <span className="info-badge">{p.genero === 'M' ? '♂ M' : '♀ F'}</span>
                        <span className="info-badge">HC: {p.numero_historia}</span>
                    </div>

                    <div className="paciente-detalles-extra">
                        <div className="detalle-row">
                            <FileText className="icon-gold" />
                            <span>DNI: {p.documento_identidad}</span>
                        </div>
                        {formData.telefono_consulta && (
                            <div className="detalle-row">
                                <Heart className="icon-gold" />
                                <span>{formData.telefono_consulta}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navegación de Tabs */}
                <nav className="consulta-nav">
                    <button
                        className={`nav-item ${activeTab === 'antecedentes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('antecedentes')}
                    >
                        <Heart size={18} />
                        Antecedentes
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'motivos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('motivos')}
                    >
                        <ClipboardList size={18} />
                        Motivos Estéticos
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'vitales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vitales')}
                    >
                        <Activity size={18} />
                        Vitales & Evaluación
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'tratamiento' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tratamiento')}
                    >
                        <Stethoscope size={18} />
                        Plan de Tratamiento
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
                        onClick={() => setActiveTab('media')}
                    >
                        <ImageIcon size={18} />
                        Imágenes & Videos
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        <FileText size={18} />
                        Historial Clínico
                    </button>
                </nav>

                {/* Indicador de Estado */}
                {estaListaParaCirugia() ? (
                    <div style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginTop: '16px'
                    }}>
                        ✅ Lista para Cirugía
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginTop: '16px'
                    }}>
                        ⚠️ Completar Requisitos
                    </div>
                )}

                {/* Acciones */}
                <div className="sidebar-actions">
                    <button className="btn-save-consulta" onClick={handleSubmit} disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Guardando...' : 'Guardar Consulta'}
                    </button>
                    <button className="btn-back" onClick={onClose}>
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                </div>
            </div>

            {/* CONTENIDO DERECHO */}
            <div className="consulta-content">
                {/* Header */}
                <div className="content-header">
                    <div>
                        <h2>Consulta Externa - Cirugía Estética</h2>
                        <div className="atencion-meta">
                            <span>Atención #{atencion.numero_atencion}</span>
                            <span>•</span>
                            <span>{new Date(atencion.fecha_atencion).toLocaleDateString('es-PE')}</span>
                        </div>
                    </div>
                    <div className="tipo-tag">{atencion.tipo_atencion}</div>
                </div>

                {/* Formulario Scrolleable */}
                <div className="form-sections-container custom-scrollbar">
                    {/* Datos Generales del Paciente */}
                    <DatosGeneralesPaciente
                        paciente={p}
                        atencion={atencion}
                        formData={formData}          // <--- ESTO FALTABA
                        handleChange={handleChange}  // <--- ESTO FALTABA
                    />



                    {activeTab === 'antecedentes' && (
                        <>
                            {/* ANTECEDENTES CLÍNICOS */}
                            <div className="form-section fade-in-right">
                                <h3 className="section-title">Antecedentes Clínicos</h3>

                                <div className="checkbox-grid-4">
                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.diabetes}
                                            onChange={() => handleCheckboxChange('diabetes')}
                                        />
                                        <span>Diabetes</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.hipertension_arterial}
                                            onChange={() => handleCheckboxChange('hipertension_arterial')}
                                        />
                                        <span>Hipertensión Arterial</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.cancer}
                                            onChange={() => handleCheckboxChange('cancer')}
                                        />
                                        <span>Cáncer</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.artritis}
                                            onChange={() => handleCheckboxChange('artritis')}
                                        />
                                        <span>Artritis</span>
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Otros Antecedentes:</label>
                                    <textarea
                                        rows="2"
                                        value={formData.otros_antecedentes}
                                        onChange={(e) => handleChange('otros_antecedentes', e.target.value)}
                                        placeholder="Especifique otros antecedentes..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tratamiento que recibe actualmente:</label>
                                    <textarea
                                        rows="2"
                                        value={formData.tratamiento_actual}
                                        onChange={(e) => handleChange('tratamiento_actual', e.target.value)}
                                        placeholder="Medicamentos actuales..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Intervenciones Quirúrgicas:</label>
                                    <textarea
                                        rows="2"
                                        value={formData.intervenciones_quirurgicas}
                                        onChange={(e) => handleChange('intervenciones_quirurgicas', e.target.value)}
                                        placeholder="Cirugías previas..."
                                    />
                                </div>
                            </div>

                            {/* ENFERMEDADES INFECTOCONTAGIOSAS */}
                            <div className="form-section fade-in-right">
                                <h3 className="section-title">Enfermedades Infectocontagiosas</h3>

                                <div className="checkbox-grid-3">
                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.infecciones_urinarias}
                                            onChange={() => handleCheckboxChange('infecciones_urinarias')}
                                        />
                                        <span>Infecciones Urinarias</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.pulmones}
                                            onChange={() => handleCheckboxChange('pulmones')}
                                        />
                                        <span>Pulmones</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.infec_gastrointestinal}
                                            onChange={() => handleCheckboxChange('infec_gastrointestinal')}
                                        />
                                        <span>Infec. Gastrointestinal</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.enf_transmision_sexual}
                                            onChange={() => handleCheckboxChange('enf_transmision_sexual')}
                                        />
                                        <span>Enf. Transmisión Sexual</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.hepatitis}
                                            onChange={() => handleCheckboxChange('hepatitis')}
                                        />
                                        <span>Hepatitis</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.hiv}
                                            onChange={() => handleCheckboxChange('hiv')}
                                        />
                                        <span>HIV</span>
                                    </label>
                                </div>

                                {formData.hepatitis && (
                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <label>Tipo de Hepatitis:</label>
                                        <input
                                            type="text"
                                            value={formData.hepatitis_tipo}
                                            onChange={(e) => handleChange('hepatitis_tipo', e.target.value)}
                                            placeholder="Especifique tipo (A, B, C...)"
                                        />
                                    </div>
                                )}

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Otros:</label>
                                    <textarea
                                        rows="2"
                                        value={formData.otros_enfermedades}
                                        onChange={(e) => handleChange('otros_enfermedades', e.target.value)}
                                        placeholder="Otras enfermedades..."
                                    />
                                </div>
                            </div>

                            {/* ALERGIAS (CRÍTICO) */}
                            <div className="form-section fade-in-right" style={{ border: '2px solid #EF4444' }}>
                                <h3 className="section-title" style={{ borderColor: '#EF4444' }}>
                                    <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                                    Alergias (CRÍTICO para Anestesia)
                                </h3>

                                <div className="checkbox-grid-2">
                                    <div>
                                        <label className="checkbox-inline">
                                            <input
                                                type="checkbox"
                                                checked={formData.medicamentos_alergia}
                                                onChange={() => handleCheckboxChange('medicamentos_alergia')}
                                            />
                                            <span>Medicamentos</span>
                                        </label>
                                        {formData.medicamentos_alergia && (
                                            <div className="form-group" style={{ marginTop: '8px' }}>
                                                <input
                                                    type="text"
                                                    value={formData.medicamentos_alergia_detalle}
                                                    onChange={(e) => handleChange('medicamentos_alergia_detalle', e.target.value)}
                                                    placeholder="¿Cuáles medicamentos?"
                                                    style={{ borderColor: '#EF4444' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="checkbox-inline">
                                            <input
                                                type="checkbox"
                                                checked={formData.alimentos_alergia}
                                                onChange={() => handleCheckboxChange('alimentos_alergia')}
                                            />
                                            <span>Alimentos</span>
                                        </label>
                                        {formData.alimentos_alergia && (
                                            <div className="form-group" style={{ marginTop: '8px' }}>
                                                <input
                                                    type="text"
                                                    value={formData.alimentos_alergia_detalle}
                                                    onChange={(e) => handleChange('alimentos_alergia_detalle', e.target.value)}
                                                    placeholder="¿Cuáles alimentos?"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Otros:</label>
                                    <input
                                        type="text"
                                        value={formData.otros_alergias}
                                        onChange={(e) => handleChange('otros_alergias', e.target.value)}
                                        placeholder="Otras alergias..."
                                    />
                                </div>
                            </div>

                            {/* FISIOLÓGICOS (Solo mujeres) */}
                            {p.genero === 'F' && (
                                <div className="form-section fade-in-right">
                                    <h3 className="section-title">Fisiológicos</h3>

                                    <div className="form-group">
                                        <label>Fecha de la última regla:</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_ultima_regla}
                                            onChange={(e) => handleChange('fecha_ultima_regla', e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                                        <label className="checkbox-inline">
                                            <input
                                                type="checkbox"
                                                checked={formData.regular}
                                                onChange={() => handleCheckboxChange('regular')}
                                            />
                                            <span>Regular</span>
                                        </label>

                                        <label className="checkbox-inline">
                                            <input
                                                type="checkbox"
                                                checked={formData.irregular}
                                                onChange={() => handleCheckboxChange('irregular')}
                                            />
                                            <span>Irregular</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* HÁBITOS NOCIVOS */}
                            <div className="form-section fade-in-right">
                                <h3 className="section-title">Hábitos Nocivos (Afectan Cicatrización)</h3>

                                <div className="checkbox-grid-3">
                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.tabaco}
                                            onChange={() => handleCheckboxChange('tabaco')}
                                        />
                                        <span>Tabaco</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.alcohol}
                                            onChange={() => handleCheckboxChange('alcohol')}
                                        />
                                        <span>Alcohol</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.farmacos}
                                            onChange={() => handleCheckboxChange('farmacos')}
                                        />
                                        <span>Fármacos</span>
                                    </label>
                                </div>
                            </div>


                        </>
                    )}
                    {activeTab === 'motivos' && (
                        <MotivosEsteticosTab formData={formData} handleChange={handleChange} />
                    )}
                    {activeTab === 'vitales' && (
                        <VitalesEvaluacionTab formData={formData} handleChange={handleChange} />
                    )}
                    {activeTab === 'tratamiento' && (
                        <PlanTratamientoTab formData={formData} handleChange={handleChange} />
                    )}
                    {activeTab === 'media' && (
                        <ImagenesVideosTab
                            consultaId={formData.id} // Para saber a qué consulta vincular lo NUEVO que subas
                            pacienteId={p.id}        // ✅ NUEVO: Para buscar TODO el historial del paciente
                        />
                    )}
                    {activeTab === 'historial' && (
                        <>
                            {/* LISTADO NORMAL */}
                            <HistorialClinicoTab
                                pacienteId={p.id}
                                onVerDetalle={(consulta) => setConsultaSeleccionadaHistorial(consulta)}
                            />

                            {/* MODAL FLOTANTE (Solo se muestra si hay una consulta seleccionada) */}
                            {consultaSeleccionadaHistorial && (
                                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                                    <div className="modal-content" style={{ maxWidth: '95%', width: '1300px', height: '90vh' }}>
                                        <div className="modal-header">
                                            <h3>Vista de Registro Anterior</h3>
                                            <button className="btn-close" onClick={() => setConsultaSeleccionadaHistorial(null)}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="modal-body" style={{ padding: 0, overflow: 'hidden' }}>
                                            <VisualizadorConsulta
                                                consulta={consultaSeleccionadaHistorial}
                                                paciente={p}
                                                onClose={() => setConsultaSeleccionadaHistorial(null)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ConsultaExterna;