import React, { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Clock, Stethoscope, Briefcase } from 'lucide-react';
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
    const [medicos, setMedicos] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);

    // Estados de carga
    const [loadingMedicos, setLoadingMedicos] = useState(false);
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    // Estados paciente
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);
    const [buscarDni, setBuscarDni] = useState('');

    const [showPacienteModal, setShowPacienteModal] = useState(false);

    const [formData, setFormData] = useState({
        paciente_id: '',
        especialidad_id: '',
        medico_id: '',
        fecha_cita: new Date().toISOString().split('T')[0],
        hora_cita: '',
        tipo_atencion: 'Consulta Externa',
        tipo_cobertura: 'Particular',
        motivo_consulta: '',
        observaciones: '',
        estado: 'Programada'
    });

    // ✅ CORRECCIÓN: useEffect mejorado para cargar datos en modo edición
    useEffect(() => {
        const cargarDataInicial = async () => {
            console.log('🔄 Cargando datos iniciales...', { esEdicion, atencion });

            // Cargar especialidades siempre
            const listaEsp = await utilsService.getEspecialidades();
            if (Array.isArray(listaEsp)) {
                setEspecialidades(listaEsp);
                console.log('✅ Especialidades cargadas:', listaEsp.length);
            }

            // Si es edición, cargar los datos de la atención
            if (atencion) {
                console.log('📝 Modo edición - Datos de atención:', atencion);

                // ✅ Establecer paciente seleccionado
                if (atencion.paciente) {
                    setPacienteSeleccionado(atencion.paciente);
                    console.log('✅ Paciente establecido:', atencion.paciente);
                }

                // ✅ Cargar médicos de la especialidad
                const especialidadId = atencion.medico?.especialidad_id || atencion.especialidad_id;
                if (especialidadId) {
                    console.log('🔄 Cargando médicos de especialidad:', especialidadId);
                    const listaMed = await utilsService.getMedicosPorEspecialidad(especialidadId);
                    if (Array.isArray(listaMed)) {
                        setMedicos(listaMed);
                        console.log('✅ Médicos cargados:', listaMed.length);
                    }
                }

                // ✅ CORRECCIÓN: Formatear fecha correctamente
                let fechaFormateada = atencion.fecha_atencion;
                if (fechaFormateada && fechaFormateada.includes('T')) {
                    fechaFormateada = fechaFormateada.split('T')[0];
                }

                // ✅ Establecer datos del formulario
                const datosFormulario = {
                    paciente_id: atencion.paciente_id || '',
                    especialidad_id: especialidadId || '',
                    medico_id: atencion.medico_id || '',
                    fecha_cita: fechaFormateada || new Date().toISOString().split('T')[0],
                    hora_cita: atencion.hora_ingreso || '',
                    tipo_atencion: atencion.tipo_atencion || 'Consulta Externa',
                    tipo_cobertura: atencion.tipo_cobertura || 'Particular',
                    motivo_consulta: atencion.motivo_consulta || '',
                    observaciones: atencion.observaciones || '',
                    estado: atencion.estado || 'Programada'
                };

                setFormData(datosFormulario);
                console.log('✅ Formulario establecido:', datosFormulario);
            }
        };

        cargarDataInicial();
    }, [atencion, esEdicion]);

    // Cargar médicos cuando cambia la especialidad
    useEffect(() => {
        const cargarMedicos = async () => {
            if (!formData.especialidad_id) {
                setMedicos([]);
                return;
            }

            // No recargar si ya están cargados en modo edición
            if (esEdicion && medicos.length > 0) return;

            setLoadingMedicos(true);
            const lista = await utilsService.getMedicosPorEspecialidad(formData.especialidad_id);
            setMedicos(Array.isArray(lista) ? lista : []);
            setLoadingMedicos(false);
        };

        // Solo cargar si no es edición o si la especialidad cambió
        if (!esEdicion) {
            cargarMedicos();
        }
    }, [formData.especialidad_id, esEdicion]);

    // Cargar horarios disponibles
    useEffect(() => {
        const cargarHorarios = async () => {
            if (!formData.medico_id || !formData.fecha_cita) {
                setHorariosDisponibles([]);
                return;
            }

            setLoadingHorarios(true);
            const slots = await utilsService.getCitasDisponibles(formData.medico_id, formData.fecha_cita);
            setHorariosDisponibles(Array.isArray(slots) ? slots : []);
            setLoadingHorarios(false);
        };

        // Solo cargar horarios en modo creación o cuando cambien médico/fecha
        if (!esEdicion || (formData.medico_id && formData.fecha_cita)) {
            cargarHorarios();
        }
    }, [formData.medico_id, formData.fecha_cita, esEdicion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Limpiar campos dependientes al cambiar especialidad
            if (name === 'especialidad_id') {
                newState.medico_id = '';
                newState.hora_cita = '';
            }

            // Limpiar horario al cambiar médico
            if (name === 'medico_id') {
                newState.hora_cita = '';
            }

            return newState;
        });
    };

    const handleBuscarPaciente = async () => {
        if (!buscarDni) return;

        setBuscandoPaciente(true);
        try {
            const res = await pacienteService.searchByDocument(buscarDni);

            if (res.success && res.data) {
                setPacienteSeleccionado(res.data);
                setFormData(prev => ({ ...prev, paciente_id: res.data.id }));

                Swal.fire({
                    icon: 'success',
                    title: 'Paciente Encontrado',
                    text: `${res.data.nombres} ${res.data.apellido_paterno}`,
                    timer: 1000,
                    showConfirmButton: false
                });
            } else {
                const result = await Swal.fire({
                    title: 'Paciente no encontrado',
                    text: `El DNI ${buscarDni} no está registrado. ¿Desea registrar un nuevo paciente?`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, registrar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#3B82F6'
                });

                if (result.isConfirmed) {
                    setShowPacienteModal(true);
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error al buscar paciente', 'error');
        } finally {
            setBuscandoPaciente(false);
        }
    };

    const handlePacienteCreado = (pacienteNuevo) => {
        setPacienteSeleccionado(pacienteNuevo);
        setFormData(prev => ({ ...prev, paciente_id: pacienteNuevo.id }));
        setShowPacienteModal(false);
        setBuscarDni('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pacienteSeleccionado || !formData.hora_cita) {
            Swal.fire('Error', 'Complete todos los campos obligatorios', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                paciente_id: formData.paciente_id,
                medico_id: formData.medico_id,
                fecha_atencion: formData.fecha_cita,
                hora_ingreso: formData.hora_cita,
                tipo_atencion: formData.tipo_atencion,
                tipo_cobertura: formData.tipo_cobertura,
                motivo_consulta: formData.motivo_consulta,
                observaciones: formData.observaciones,
                estado: formData.estado
            };

            let response;
            if (esEdicion) {
                response = await atencionService.updateAtencion(atencion.id, payload);
            } else {
                response = await atencionService.createAtencion(payload);
            }

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: esEdicion ? 'Atención Actualizada' : 'Atención Creada',
                    timer: 1500,
                    showConfirmButton: false
                });
                onSuccess();
            } else {
                Swal.fire('Error', response.message || 'Error al guardar', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
                <div className="modal-header">
                    <h3>{esEdicion ? 'Editar Atención' : 'Nueva Atención'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* SECCIÓN PACIENTE */}
                    {!esEdicion && (
                        <div className="form-section">
                            <div className="section-label">
                                <User size={18} style={{ marginRight: '8px' }} /> Paciente
                            </div>

                            {!pacienteSeleccionado ? (
                                <div className="patient-search-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder="Ingrese DNI (8 dígitos)..."
                                            value={buscarDni}
                                            onChange={(e) => setBuscarDni(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleBuscarPaciente()}
                                            maxLength={15}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-save"
                                        onClick={handleBuscarPaciente}
                                        disabled={buscandoPaciente}
                                    >
                                        {buscandoPaciente ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                            ) : (
                                <div className="patient-selected-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div className="patient-card-content">
                                            <h4>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno} {pacienteSeleccionado.apellido_materno}</h4>
                                            <div className="patient-card-details">
                                                <span>DNI: {pacienteSeleccionado.documento_identidad}</span>
                                                <span>•</span>
                                                <span>Tel: {pacienteSeleccionado.telefono || 'Sin teléfono'}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#DC2626',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline'
                                            }}
                                            onClick={() => {
                                                setPacienteSeleccionado(null);
                                                setFormData({ ...formData, paciente_id: '' });
                                            }}
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MOSTRAR PACIENTE EN MODO EDICIÓN */}
                    {esEdicion && pacienteSeleccionado && (
                        <div className="form-section">
                            <div className="section-label">
                                <User size={18} style={{ marginRight: '8px' }} /> Paciente
                            </div>
                            <div className="patient-selected-card">
                                <div className="patient-card-content">
                                    <h4>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno} {pacienteSeleccionado.apellido_materno}</h4>
                                    <div className="patient-card-details">
                                        <span>DNI: {pacienteSeleccionado.documento_identidad}</span>
                                        <span>•</span>
                                        <span>Tel: {pacienteSeleccionado.telefono || 'Sin teléfono'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DATOS DE LA CITA */}
                    <div className="form-section">
                        <div className="section-label">
                            <Calendar size={18} style={{ marginRight: '8px' }} /> Datos de la Cita
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Especialidad *</label>
                                <div className="input-with-icon">
                                    <Briefcase size={18} />
                                    <select
                                        name="especialidad_id"
                                        value={formData.especialidad_id}
                                        onChange={handleChange}
                                        required
                                        disabled={esEdicion}
                                    >
                                        <option value="">-- Seleccione --</option>
                                        {especialidades.map(esp => (
                                            <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Médico *</label>
                                <div className="input-with-icon">
                                    <Stethoscope size={18} />
                                    <select
                                        name="medico_id"
                                        value={formData.medico_id}
                                        onChange={handleChange}
                                        disabled={!formData.especialidad_id || loadingMedicos || esEdicion}
                                        required
                                    >
                                        <option value="">{loadingMedicos ? 'Cargando...' : '-- Seleccione --'}</option>
                                        {medicos.map(med => (
                                            <option key={med.id} value={med.id}>
                                                {med.nombre_completo || med.user?.name || `Médico ${med.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Fecha *</label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        name="fecha_cita"
                                        value={formData.fecha_cita}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-grid-3" style={{ marginTop: '16px' }}>
                            <div className="form-group">
                                <label>Horario *</label>
                                <div className="input-with-icon">
                                    <Clock size={18} />
                                    <select
                                        name="hora_cita"
                                        value={formData.hora_cita}
                                        onChange={handleChange}
                                        disabled={!formData.medico_id || loadingHorarios}
                                        required
                                    >
                                        <option value="">{loadingHorarios ? 'Buscando...' : '-- Hora --'}</option>
                                        {esEdicion && formData.hora_cita && (
                                            <option value={formData.hora_cita}>
                                                {formData.hora_cita.substring(0, 5)} (Actual)
                                            </option>
                                        )}
                                        {horariosDisponibles.map((hora, idx) => (
                                            <option key={idx} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tipo Atención</label>
                                <select
                                    name="tipo_atencion"
                                    value={formData.tipo_atencion}
                                    onChange={handleChange}
                                >
                                    <option>Consulta Externa</option>
                                    <option>Procedimiento</option>
                                    <option>Control</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Cobertura</label>
                                <select
                                    name="tipo_cobertura"
                                    value={formData.tipo_cobertura}
                                    onChange={handleChange}
                                >
                                    <option>Particular</option>
                                    <option>SIS</option>
                                    <option>EsSalud</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Motivo</label>
                        <textarea
                            name="motivo_consulta"
                            value={formData.motivo_consulta}
                            onChange={handleChange}
                            rows="2"
                            style={{ width: '100%' }}
                            placeholder="Motivo de consulta..."
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={loading || !pacienteSeleccionado || !formData.hora_cita}
                        >
                            {loading ? 'Procesando...' : esEdicion ? 'Actualizar' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL DE PACIENTE */}
            {showPacienteModal && (
                <PacienteForm
                    dniInicial={buscarDni}
                    onClose={() => setShowPacienteModal(false)}
                    onSuccess={handlePacienteCreado}
                />
            )}
        </div>
    );
};

export default FormularioAtencion;