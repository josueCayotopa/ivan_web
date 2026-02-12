import React, { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Clock, Stethoscope, Briefcase, Filter, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import atencionService from '../../../services/atencionService';
import pacienteService from '../../../services/pacienteService';
import utilsService from '../../../services/utilsService';
import PacienteForm from '../pacientes/PacienteForm';

const FormularioAtencion = ({ atencion, onClose, onSuccess }) => {
    const esEdicion = !!atencion;
    const [loading, setLoading] = useState(false);

    // Estados para selects
    const [especialidades, setEspecialidades] = useState([]);
    const [medicoUnico, setMedicoUnico] = useState(null);
    const TIPOS_ATENCION = [
        { id: 'Consulta Externa', nombre: 'Consulta Externa' },
        { id: 'Emergencia', nombre: 'Emergencia' },
        { id: 'Hospitalización', nombre: 'Hospitalización' },
        { id: 'Cirugía', nombre: 'Cirugía' },
        { id: 'Procedimiento', nombre: 'Procedimiento' },
        { id: 'Control', nombre: 'Control' }
    ];
    const CATEGORIAS_ATENCION = [
        'Consulta',
        'Procedimiento Menor',
        'Cirugía',
        'Control',
        'Emergencia'
    ];
    // Estados paciente
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);
    const [buscarDni, setBuscarDni] = useState('');
    const [showPacienteModal, setShowPacienteModal] = useState(false);

    const [formData, setFormData] = useState({
        paciente_id: '',
        especialidad_id: '',
        medico_id: '',
        fecha_atencion: new Date().toISOString().split('T')[0],
       

        tipo_cobertura: 'Particular',
        motivo_consulta: '',
        observaciones: '',

        tipo_atencion: '',
        monto_total: '',
        estado: 'Programada'
    });

    const normalizarLista = (resp) => {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp;
        const data = resp.data?.data || resp.data || [];
        return Array.isArray(data) ? data : [];
    };

    // CARGA INICIAL Y SELECCIÓN DE MÉDICO ÚNICO
    useEffect(() => {
        const inicializarFormulario = async () => {
            // 1. Cargar Especialidades
            const respEsp = await utilsService.getEspecialidades();
            const listaEsp = normalizarLista(respEsp);
            setEspecialidades(listaEsp);

            // 2. Cargar Médicos y buscar al Dr. Ivan Pareja (ID 21 según tu DB)
            // Si solo hay uno, lo seleccionamos por defecto
            const respMed = await utilsService.getMedicosPorEspecialidad(2); // ID 2 = Cirugía Estética
            const listaMed = normalizarLista(respMed);

            // Buscamos al médico por ID (21) o el primero de la lista
            const medico = listaMed.find(m => m.id === 21) || listaMed[0];

            if (medico) {
                setMedicoUnico(medico);
                setFormData(prev => ({
                    ...prev,
                    medico_id: medico.id,
                    especialidad_id: medico.especialidad_id || 2
                }));
            }

            if (atencion) {
                if (atencion.paciente) setPacienteSeleccionado(atencion.paciente);
                setFormData({
                    paciente_id: atencion.paciente_id || '',
                    medico_id: atencion.medico_id || '',
                    especialidad_id: atencion.especialidad_id || '',
                    tipo_atencion: atencion.tipo_atencion || '',
                    tipo_cobertura: atencion.tipo_cobertura || '',
                    fecha_atencion: atencion.fecha_atencion ? atencion.fecha_atencion.substring(0, 10) : '',
                 
                    estado: atencion.estado || 'Programada',
                    motivo_consulta: atencion.motivo_consulta || '',
                    observaciones: atencion.observaciones || '',

                    monto_total: atencion.monto_total || '' // Agregamos el monto que pediste antes
                });
            }
        };

        inicializarFormulario();
    }, [atencion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscarPaciente = async () => {
        if (!buscarDni) return;
        setBuscandoPaciente(true);
        try {
            const res = await pacienteService.searchByDocument(buscarDni);
            if (res.success && res.data) {
                setPacienteSeleccionado(res.data);
                setFormData(prev => ({ ...prev, paciente_id: res.data.id }));
            } else {
                const result = await Swal.fire({
                    title: 'No encontrado',
                    text: `¿Registrar nuevo paciente?`,
                    icon: 'info',
                    showCancelButton: true
                });
                if (result.isConfirmed) setShowPacienteModal(true);
            }
        } catch (error) { console.error(error); }
        finally { setBuscandoPaciente(false); }
    };

    // FormularioAtencion.jsx - Dentro de handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ Extraemos 'hora_ingreso' para NO enviarla (según tu petición)
            // El campo 'monto_total' ya viene dentro de formData
            const { hora_ingreso, ...payload } = formData;

            let response;
            if (esEdicion) {
                // POST /atenciones/update
                response = await atencionService.updateAtencion(atencion.id, payload);
            } else {
                // POST /atenciones/store
                response = await atencionService.createAtencion(payload);
            }

            if (response.success) {
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Atención guardada', timer: 1500 });
                if (onSuccess) onSuccess(response.data);
                onClose();
            } else {
                throw new Error(response.message || 'Error al guardar');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error en el servidor'
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>{esEdicion ? 'Editar Atención' : 'Rápida - Nueva Atención'}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* BUSCADOR DE PACIENTE */}
                    <div className="form-section">
                        <div className="section-label"><User size={18} /> Información del Paciente</div>
                        {!pacienteSeleccionado ? (
                            <div className="patient-search-row" style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Ingrese DNI del paciente..."
                                    value={buscarDni}
                                    onChange={(e) => setBuscarDni(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1 }}
                                />
                                <button type="button" className="btn-save" onClick={handleBuscarPaciente}>
                                    <Search size={16} /> Buscar
                                </button>
                            </div>
                        ) : (
                            <div className="patient-selected-card" style={{ background: '#F0F9FF', padding: '15px', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ fontSize: '1.1rem' }}>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno}</strong>
                                        <p style={{ margin: 0, color: '#64748B' }}>DNI: {pacienteSeleccionado.documento_identidad}</p>
                                    </div>
                                    <button type="button" onClick={() => setPacienteSeleccionado(null)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }}>Cambiar</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DATOS DE ATENCIÓN SIMPLIFICADOS */}
                    <div className="form-section" style={{ marginTop: '20px' }}>
                        <div className="section-label"><Stethoscope size={18} /> Detalles de la Cita</div>
                        <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                            <div className="form-group">
                                <label>Médico Tratante</label>
                                <div className="input-readonly" style={{ padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Stethoscope size={16} color="#3B82F6" />
                                    <span>{medicoUnico ? `Dr. ${medicoUnico.nombre_completo || 'Ivan Pareja'}` : 'Cargando médico...'}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha de Atención *</label>
                                <input
                                    type="date"
                                    name="fecha_atencion"
                                    value={formData.fecha_atencion}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                           


                        </div>
                        {/* CATEGORÍA DE ATENCIÓN */}
                        <div className="form-group">
                            <label>Tipo de Atención *</label>
                            <div className="input-with-icon">
                                <Filter size={18} color="#6B7280" />
                                <select
                                    name="tipo_atencion"
                                    value={formData.tipo_atencion}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccione tipo...</option>
                                    {/* Cambia CATEGORIAS_ATENCION por TIPOS_ATENCION */}
                                    {TIPOS_ATENCION.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* MOTIVO DETALLADO (Tu código actual mejorado) */}
                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label>Motivo de Consulta / Observaciones Específicas</label>
                            <textarea
                                name="motivo_consulta"
                                value={formData.motivo_consulta}
                                onChange={handleChange}
                                rows="3"
                                className="form-control"
                                placeholder="Ej: Rinoplastia estética, retiro de puntos, evaluación de cicatriz..."
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Monto Total (S/)</label>
                            <input
                                type="number"
                                name="monto_total" // ✅ Debe ser monto_total
                                value={formData.monto_total} // ✅ Debe ser monto_total
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>


                    </div>
                    {/* BOTONES DE ACCIÓN */}
                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '15px' }}>
                        <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={loading} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? (
                                <> <div className="spinner-small"></div> Guardando... </>
                            ) : (
                                <> <Save size={18} /> {esEdicion ? 'Actualizar Atención' : 'Confirmar Atención'} </>
                            )}
                        </button>
                    </div>


                </form>

                {showPacienteModal && (
                    <PacienteForm
                        onClose={() => setShowPacienteModal(false)}
                        onSuccess={(p) => { setPacienteSeleccionado(p); setFormData(prev => ({ ...prev, paciente_id: p.id })); setShowPacienteModal(false); }}
                        initialDni={buscarDni}
                    />
                )}
            </div>
        </div>
    );
};

export default FormularioAtencion;