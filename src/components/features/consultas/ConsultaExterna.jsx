// ConsultaExterna.jsx - OPTIMIZADO PARA CIRUGÍA ESTÉTICA
import React, { useState, useEffect } from 'react';
import {
    User, FileText, Activity, Stethoscope, ClipboardList,
    Save, ArrowLeft, Heart, DollarSign, FileSignature, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import consultaExternaService from '../../../services/consultaExternaService';
import DatosGeneralesPaciente from './DatosGeneralesPaciente';
import MotivosEsteticosTab from './MotivosEsteticosTab';
import VitalesEvaluacionTab from './VitalesEvaluacionTab';
import PlanTratamientoTab from './PlanTratamientoTab';
import ImagenesVideosTab from './ImagenesVideosTab';
import HistorialClinicoTab from './HistorialClinicoTab';
import { Image as ImageIcon } from 'lucide-react';
import './ConsultaExterna.css';

const ConsultaExterna = ({ atencion, onClose }) => {
    const [activeTab, setActiveTab] = useState('antecedentes');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const p = atencion?.paciente || {};

    // ==================== ESTADO DEL FORMULARIO ====================
    const [formData, setFormData] = useState({
        // IDENTIFICADORES
        id: null,
        atencion_id: atencion?.id || null,

        // DATOS ACTUALES
        cantidad_hijos: '',
        ultimo_embarazo: '',
        // telefono_consulta: p.celular || p.telefono || '',
        // direccion_consulta: p.direccion || '',
        // ocupacion_actual: p.ocupacion || '',
        estado_civil: '', // <--- AGREGA ESTO

        // ANTECEDENTES CLÍNICOS (Booleanos)
        diabetes: false,
        hipertension_arterial: false,
        cancer: false,
        artritis: false,
        otros_antecedentes: '',
        tratamiento_actual: '',
        intervenciones_quirurgicas: '',

        // ENFERMEDADES INFECTOCONTAGIOSAS (Booleanos)
        enfermedades_infectocontagiosas: false,
        infecciones_urinarias: false,
        infecciones_urinarias_detalle: '',
        pulmones: false,
        infec_gastrointestinal: false,
        enf_transmision_sexual: false,
        hepatitis: false,
        hepatitis_tipo: '',
        hiv: false,
        otros_enfermedades: '',

        // ALERGIAS (CRÍTICO PARA CIRUGÍA)
        medicamentos_alergia: false,
        medicamentos_alergia_detalle: '',
        alimentos_alergia: false,
        alimentos_alergia_detalle: '',
        otros_alergias: '',

        // FISIOLÓGICOS
        fecha_ultima_regla: '',
        regular: false,
        irregular: false,

        // HÁBITOS NOCIVOS
        tabaco: false,
        alcohol: false,
        farmacos: false,

        // MARKETING/REFERENCIA
        instagram_dr_ivan_pareja: false,
        facebook_dr_ivan_pareja: false,
        radio: false,
        tv: false,
        internet: false,
        referencia_otro: '',

        // MOTIVOS ESTÉTICOS (NUEVA VERSIÓN LIMPIA)
        motivos_zonas: '',
        motivos_tratamientos_previos: '',
        expectativa_paciente: '',
        // ✅ Estos 3 reemplazan a los 20 checkboxes de arriba
        motivo_facial: '',
        motivo_corporal: '',
        motivo_capilar: '',
        otros_motivos: '',

        // VITALES & EVALUACIÓN
        presion_arterial_sistolica: '',
        presion_arterial_diastolica: '',
        frecuencia_cardiaca: '',
        peso: '',
        talla: '',
        imc: '',
        evaluacion_zona: '',

        // PLAN DE TRATAMIENTO
        procedimiento_propuesto: '',
        tecnica_utilizar: '',
        productos_usar: '',
        numero_sesiones: 1,
        precio_estimado: '',
        proxima_cita: '',

        // INDICACIONES
        indicaciones_pre: '',
        indicaciones_post: '',

        // CONTROL
        ficha_completada: false

    });

    // ==================== EFFECTS ====================

    useEffect(() => {
        if (atencion?.id) {
            cargarConsulta();
        }
    }, [atencion]);


    // Auto-calcular IMC cuando cambian peso o talla
    useEffect(() => {
        if (formData.peso && formData.talla) {
            const imc = consultaExternaService.calcularIMCLocal(
                parseFloat(formData.peso),
                parseFloat(formData.talla)
            );
            if (imc) {
                setFormData(prev => ({ ...prev, imc }));
            }
        }
    }, [formData.peso, formData.talla]);


  
    // ==================== FUNCIONES DE CARGA ====================

    // ==================== CARGAR DATOS (Lectura Optimizada) ====================
    const cargarConsulta = async () => {
        if (!atencion?.id) return;

        setLoading(true);
        try {
            console.log('🔍 Buscando historia para atención ID:', atencion.id);

            // Llamamos al endpoint que devuelve todo (Consulta + Atención + Paciente Fresco)
            const response = await consultaExternaService.getByAtencionId(atencion.id);

            if (response.success && response.data) {
                const data = response.data;
                console.log('✅ Historia encontrada:', data);

                // 1. Obtener Paciente Fresco (Prioridad: API > Prop)
                // Esto asegura que veamos los datos sociales más recientes
                const pacienteFresco = data.atencion?.paciente || p;

                // 2. Parsear presión arterial (de "120/80" a dos campos)
                const { sistolica, diastolica } = consultaExternaService.parsearPresion(
                    data.presion_arterial || ''
                );

                // 3. Actualizar Estado (Sin usar useState dentro)
                setFormData(prev => ({
                    ...prev,

                    // === IDENTIFICADORES ===
                    id: data.id,
                    atencion_id: data.atencion_id,
                    medico_id: data.medico_id || atencion.medico_id,

                    // === DATOS SOCIALES (Leemos del Paciente Fresco) ===
                    cantidad_hijos: pacienteFresco.cantidad_hijos || '',
                    ultimo_embarazo: pacienteFresco.ultimo_embarazo || '',
                    estado_civil: pacienteFresco.estado_civil || '',
                    ocupacion_actual: pacienteFresco.ocupacion || '',
                    telefono_consulta: pacienteFresco.celular || pacienteFresco.telefono || '',
                    direccion_consulta: pacienteFresco.direccion || '',

                    // === MOTIVOS ESTÉTICOS (Nuevos campos de texto) ===
                    motivos_zonas: data.motivos_zonas || '',
                    motivos_tratamientos_previos: data.motivos_tratamientos_previos || '',
                    expectativa_paciente: data.expectativa_paciente || '',
                    motivo_facial: data.motivo_facial || '',
                    motivo_corporal: data.motivo_corporal || '',
                    motivo_capilar: data.motivo_capilar || '',
                    otros_motivos: data.otros_motivos || '',

                    // === ANTECEDENTES (Booleanos) ===
                    diabetes: Boolean(data.diabetes),
                    hipertension_arterial: Boolean(data.hipertension_arterial),
                    cancer: Boolean(data.cancer),
                    artritis: Boolean(data.artritis),
                    otros_antecedentes: data.otros_antecedentes || '',
                    tratamiento_actual: data.tratamiento_actual || '',
                    intervenciones_quirurgicas: data.intervenciones_quirurgicas || '',

                    // === INFECTOCONTAGIOSAS ===
                    enfermedades_infectocontagiosas: Boolean(data.enfermedades_infectocontagiosas),
                    infecciones_urinarias: Boolean(data.infecciones_urinarias),
                    infecciones_urinarias_detalle: data.infecciones_urinarias_detalle || '',
                    pulmones: Boolean(data.pulmones),
                    infec_gastrointestinal: Boolean(data.infec_gastrointestinal),
                    enf_transmision_sexual: Boolean(data.enf_transmision_sexual),
                    hepatitis: Boolean(data.hepatitis),
                    hepatitis_tipo: data.hepatitis_tipo || '',
                    hiv: Boolean(data.hiv),
                    otros_enfermedades: data.otros_enfermedades || '',

                    // === ALERGIAS ===
                    medicamentos_alergia: Boolean(data.medicamentos_alergia),
                    medicamentos_alergia_detalle: data.medicamentos_alergia_detalle || '',
                    alimentos_alergia: Boolean(data.alimentos_alergia),
                    alimentos_alergia_detalle: data.alimentos_alergia_detalle || '',
                    otros_alergias: data.otros_alergias || '',

                    // === FISIOLÓGICOS / HÁBITOS ===
                    fecha_ultima_regla: data.fecha_ultima_regla || '',
                    regular: Boolean(data.regular),
                    irregular: Boolean(data.irregular),
                    tabaco: Boolean(data.tabaco),
                    alcohol: Boolean(data.alcohol),
                    farmacos: Boolean(data.farmacos),

                    // === MARKETING (Viene de la Atención) ===
                    // Mapeamos el campo único de texto a los booleanos visuales si es necesario
                    // o leemos directo si el backend aún los manda
                    instagram_dr_ivan_pareja: Boolean(data.instagram_dr_ivan_pareja),
                    facebook_dr_ivan_pareja: Boolean(data.facebook_dr_ivan_pareja),
                    radio: Boolean(data.radio),
                    tv: Boolean(data.tv),
                    internet: Boolean(data.internet),
                    referencia_otro: data.referencia_otro || '',

                    // === VITALES & EVALUACIÓN ===
                    presion_arterial_sistolica: sistolica,
                    presion_arterial_diastolica: diastolica,
                    frecuencia_cardiaca: data.frecuencia_cardiaca || '',
                    peso: data.peso || '',
                    talla: data.talla || '',
                    imc: data.imc || '',
                    evaluacion_zona: data.evaluacion_zona || '',

                    // === PLAN DE TRATAMIENTO ===
                    procedimiento_propuesto: data.procedimiento_propuesto || '',
                    tecnica_utilizar: data.tecnica_utilizar || '',
                    productos_usar: data.productos_usar || '',
                    numero_sesiones: data.numero_sesiones || 1,
                    precio_estimado: data.precio_estimado || '',
                    proxima_cita: data.proxima_cita || '',

                    // === INDICACIONES ===
                    indicaciones_pre: data.indicaciones_pre || '',
                    indicaciones_post: data.indicaciones_post || '',

                    // === CONTROL ===
                    ficha_completada: Boolean(data.ficha_completada)
                }));
            } else {
                console.log('✨ Nueva Historia (Modo Creación)');
                // Si es nueva, precargamos datos del paciente (props)
                setFormData(prev => ({
                    ...prev,
                    id: null, // Asegurar que es null para crear
                    cantidad_hijos: p.cantidad_hijos || '',
                    ultimo_embarazo: p.ultimo_embarazo || '',
                    estado_civil: p.estado_civil || '',
                    ocupacion_actual: p.ocupacion || '',
                    telefono_consulta: p.celular || p.telefono || '',
                    direccion_consulta: p.direccion || '',
                    // El marketing se lee de la atención si existe
                    referencia_otro: atencion.medio_captacion || ''
                }));
            }
        } catch (error) {
            console.error('❌ Error al cargar consulta:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la historia clínica. Verifique su conexión.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    // ==================== FUNCIÓN DE GUARDADO ====================

    const handleSubmit = async () => {
        // Validación mínima
        if (!formData.procedimiento_propuesto?.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Debe especificar el procedimiento propuesto',
                confirmButtonColor: '#FFC107'
            });
            return;
        }

        setSaving(true);

        try {
            // Combinar presión arterial
            const presion_arterial = consultaExternaService.formatearPresion(
                formData.presion_arterial_sistolica,
                formData.presion_arterial_diastolica
            );

            // Preparar payload
            const payload = {
                ...formData,
                presion_arterial,
                atencion_id: atencion.id
            };

            console.log('📤 Enviando consulta externa:', payload);

            // 🔥 SAVE INTELIGENTE: decide automáticamente crear o actualizar
            const response = await consultaExternaService.save(payload, formData.id);

            console.log('📥 Respuesta del servidor:', response);

            if (response.success || (response.id && response.atencion_id)) {

                // Actualizar ID si es creación nueva
                // Nota: Si response trae la data directa, usamos response.id
                const nuevoId = response.data?.id || response.id;

                if (!formData.id && nuevoId) {
                    setFormData(prev => ({ ...prev, id: nuevoId }));
                }

                // Mensaje de éxito
                await Swal.fire({
                    icon: 'success',
                    title: formData.id ? '¡Actualizada!' : '¡Creada!',
                    text: `Consulta externa guardada exitosamente`,
                    showConfirmButton: true,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#FFC107',
                    timer: 3000
                });

                // Cerrar modal
                onClose();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al guardar la consulta',
                    confirmButtonColor: '#EF4444'
                });
            }
        } catch (error) {
            console.error('❌ Error en handleSubmit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar',
                confirmButtonColor: '#EF4444'
            });
        } finally {
            setSaving(false);
        }
    };

    // ==================== FUNCIÓN PARA CAMBIAR CAMPOS ====================

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // ==================== VALIDAR SI ESTÁ LISTA PARA CIRUGÍA ====================

    const estaListaParaCirugia = () => {
        return consultaExternaService.estaListaParaCirugia(formData);
    };

    // ==================== RENDER ====================

    if (loading) {
        return (
            <div className="consulta-loading">
                <div className="spinner"></div>
                <p>Cargando historia clínica...</p>
            </div>
        );
    }

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

                            {/* RECOMENDADO POR (Marketing) */}
                            <div className="form-section fade-in-right">
                                <h3 className="section-title">¿Cómo nos conoció?</h3>

                                <div className="checkbox-grid-3">
                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.instagram_dr_ivan_pareja}
                                            onChange={() => handleCheckboxChange('instagram_dr_ivan_pareja')}
                                        />
                                        <span>Instagram Dr Ivan Pareja</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.facebook_dr_ivan_pareja}
                                            onChange={() => handleCheckboxChange('facebook_dr_ivan_pareja')}
                                        />
                                        <span>Facebook Dr Ivan Pareja</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.radio}
                                            onChange={() => handleCheckboxChange('radio')}
                                        />
                                        <span>Radio</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.tv}
                                            onChange={() => handleCheckboxChange('tv')}
                                        />
                                        <span>TV</span>
                                    </label>

                                    <label className="checkbox-card">
                                        <input
                                            type="checkbox"
                                            checked={formData.internet}
                                            onChange={() => handleCheckboxChange('internet')}
                                        />
                                        <span>Internet</span>
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Referencia (Otro):</label>
                                    <input
                                        type="text"
                                        value={formData.referencia_otro}
                                        onChange={(e) => handleChange('referencia_otro', e.target.value)}
                                        placeholder="Especifique otra referencia..."
                                    />
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
                        <HistorialClinicoTab pacienteId={p.id} />
                    )}


                </div>

            </div>
        </div>
    );
};

export default ConsultaExterna;