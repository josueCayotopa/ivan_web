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

    // Función de normalización
    const normalizarLista = (resp) => {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp;
        if (Array.isArray(resp.data)) return resp.data;
        if (Array.isArray(resp.data?.data)) return resp.data.data;
        return [];
    };

    // ✅ CAMBIO 1: Estado inicial con nombres idénticos a la Base de Datos (Laravel)
    const [formData, setFormData] = useState({
        paciente_id: '',
        especialidad_id: '',
        medico_id: '',
        fecha_atencion: new Date().toISOString().split('T')[0], // Antes fecha_cita
        hora_ingreso: '',                                       // Antes hora_cita
        tipo_atencion: 'Consulta Externa',
        tipo_cobertura: 'Particular',
        motivo_consulta: '',
        observaciones: '',
        medio_captacion: '',
        estado: 'Programada'
    });

    // 1. CARGA INICIAL
    useEffect(() => {
        const cargarDataInicial = async () => {
            // Cargar especialidades
            const resp = await utilsService.getEspecialidades();
            setEspecialidades(normalizarLista(resp));

            // Si es edición, cargar los datos de la atención
            if (atencion) {
                if (atencion.paciente) {
                    setPacienteSeleccionado(atencion.paciente);
                }

                const especialidadId = atencion.medico?.especialidad_id || atencion.especialidad_id;

                if (especialidadId) {
                    const respMed = await utilsService.getMedicosPorEspecialidad(especialidadId);
                    setMedicos(normalizarLista(respMed));
                }

                // Formatear fecha (quitar la parte de tiempo si viene completa)
                let fechaFormateada = atencion.fecha_atencion;
                if (fechaFormateada && fechaFormateada.includes('T')) {
                    fechaFormateada = fechaFormateada.split('T')[0];
                }

                // ✅ CAMBIO 2: Mapeo directo de variables de BD a Estado
                setFormData({
                    paciente_id: atencion.paciente_id || '',
                    especialidad_id: especialidadId || '',
                    medico_id: atencion.medico_id || '',
                    fecha_atencion: fechaFormateada || new Date().toISOString().split('T')[0],
                    // Aseguramos formato HH:mm cortando los segundos si existen
                    hora_ingreso: atencion.hora_ingreso ? atencion.hora_ingreso.substring(0, 5) : '',
                    tipo_atencion: atencion.tipo_atencion || 'Consulta Externa',
                    tipo_cobertura: atencion.tipo_cobertura || 'Particular',
                    motivo_consulta: atencion.motivo_consulta || '',
                    medio_captacion: atencion.medio_captacion || '',
                    observaciones: atencion.observaciones || '',
                    estado: atencion.estado || 'Programada'
                });
            }
        };

        cargarDataInicial();
    }, [atencion, esEdicion]);

    // 2. CARGAR MÉDICOS
    useEffect(() => {
        const cargarMedicos = async () => {
            if (!formData.especialidad_id) {
                setMedicos([]);
                return;
            }
            if (esEdicion && medicos.length > 0 && formData.medico_id) return;

            setLoadingMedicos(true);
            const resp = await utilsService.getMedicosPorEspecialidad(formData.especialidad_id);
            setMedicos(normalizarLista(resp));
            setLoadingMedicos(false);
        };

        cargarMedicos();
    }, [formData.especialidad_id]);

    // 3. CARGAR HORARIOS (Actualizado con fecha_atencion)
    useEffect(() => {
        const cargarHorarios = async () => {
            // ✅ CAMBIO 3: Usamos fecha_atencion en la dependencia
            if (!formData.medico_id || !formData.fecha_atencion) {
                setHorariosDisponibles([]);
                return;
            }

            setLoadingHorarios(true);
            try {
                // ✅ Enviamos el nombre correcto al servicio
                const resp = await utilsService.getCitasDisponibles(formData.medico_id, formData.fecha_atencion);
                setHorariosDisponibles(normalizarLista(resp));
            } catch (error) {
                console.error("Error cargando horarios", error);
                setHorariosDisponibles([]);
            } finally {
                setLoadingHorarios(false);
            }
        };

        cargarHorarios();
    }, [formData.medico_id, formData.fecha_atencion]); // Dependencias actualizadas

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            if (name === 'especialidad_id') {
                newState.medico_id = '';
                newState.hora_ingreso = ''; // Limpiamos hora_ingreso
            }

            if (name === 'medico_id') {
                newState.hora_ingreso = ''; // Limpiamos hora_ingreso
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
                Swal.fire({ icon: 'success', title: 'Paciente Encontrado', text: `${res.data.nombres} ${res.data.apellido_paterno}`, timer: 1000, showConfirmButton: false });
            } else {
                const result = await Swal.fire({ title: 'No encontrado', text: `DNI ${buscarDni} no registrado. ¿Registrar nuevo?`, icon: 'info', showCancelButton: true, confirmButtonText: 'Sí, registrar' });
                if (result.isConfirmed) setShowPacienteModal(true);
            }
        } catch (error) { Swal.fire('Error', 'Error al buscar', 'error'); }
        finally { setBuscandoPaciente(false); }
    };

    const handlePacienteCreado = (paciente) => {
        setPacienteSeleccionado(paciente);
        setFormData(prev => ({ ...prev, paciente_id: paciente.id }));
        setShowPacienteModal(false);
        setBuscarDni('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ✅ Validamos usando el nombre correcto: hora_ingreso
        if (!pacienteSeleccionado || !formData.hora_ingreso) {
            Swal.fire('Error', 'Complete campos obligatorios', 'warning'); return;
        }
        setLoading(true);
        try {
            // ✅ Construimos el payload directo sin renombrar campos
            const payload = {
                ...formData,
                paciente_id: formData.paciente_id || pacienteSeleccionado.id
            };

            const response = esEdicion
                ? await atencionService.updateAtencion(atencion.id, payload)
                : await atencionService.createAtencion(payload);

            if (response.success || response.data) { // Ajuste para aceptar formato de respuesta estándar
                Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
                onSuccess();
            } else {
                Swal.fire('Error', response.message || 'Error al guardar', 'error');
            }
        } catch (error) {
            console.error(error);
            // Capturamos errores de validación del backend (422) si axios los devuelve
            const errorMsg = error.response?.data?.message || 'Error de conexión';
            Swal.fire('Error', errorMsg, 'error');
        }
        finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
                <div className="modal-header">
                    <h3>{esEdicion ? 'Editar Atención' : 'Nueva Atención'}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* SECCIÓN PACIENTE */}
                    {!esEdicion && (
                        <div className="form-section">
                            <div className="section-label"><User size={18} style={{ marginRight: '8px' }} /> Paciente</div>
                            {!pacienteSeleccionado ? (
                                <div className="patient-search-row">
                                    <div className="form-group">
                                        <input type="text" placeholder="DNI..." value={buscarDni} onChange={(e) => setBuscarDni(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleBuscarPaciente()} maxLength={15} />
                                    </div>
                                    <button type="button" className="btn-save" onClick={handleBuscarPaciente} disabled={buscandoPaciente}>{buscandoPaciente ? '...' : 'Buscar'}</button>
                                </div>
                            ) : (
                                <div className="patient-selected-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno}</h4>
                                            <div className="patient-card-details"><span>DNI: {pacienteSeleccionado.documento_identidad}</span></div>
                                        </div>
                                        <button type="button" style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setPacienteSeleccionado(null); setFormData({ ...formData, paciente_id: '' }); }}>Cambiar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DATOS CITA */}
                    <div className="form-section">
                        <div className="section-label"><Calendar size={18} style={{ marginRight: '8px' }} /> Datos de la Cita</div>
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Especialidad *</label>
                                <div className="input-with-icon">
                                    <Briefcase size={18} />
                                    <select name="especialidad_id" value={formData.especialidad_id} onChange={handleChange} required disabled={esEdicion}>
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
                                    <select name="medico_id" value={formData.medico_id} onChange={handleChange} disabled={!formData.especialidad_id} required>
                                        <option value="">{loadingMedicos ? 'Cargando...' : '-- Seleccione --'}</option>
                                        {medicos.map(med => (
                                            <option key={med.id} value={med.id}>{med.nombre_completo || med.user?.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fecha *</label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    {/* ✅ CAMBIO 4: Name y Value actualizados a fecha_atencion */}
                                    <input type="date" name="fecha_atencion" value={formData.fecha_atencion} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="form-grid-3" style={{ marginTop: '16px' }}>
                            <div className="form-group">
                                <label>Horario *</label>
                                <div className="input-with-icon">
                                    <Clock size={18} />
                                    {/* ✅ CAMBIO 5: Name y Value actualizados a hora_ingreso */}
                                    <select name="hora_ingreso" value={formData.hora_ingreso} onChange={handleChange} disabled={!formData.medico_id || loadingHorarios} required>
                                        <option value="">{loadingHorarios ? 'Buscando...' : '-- Hora --'}</option>
                                        {/* Mostrar hora actual si estamos editando */}
                                        {esEdicion && formData.hora_ingreso && (
                                            <option value={formData.hora_ingreso}>
                                                {formData.hora_ingreso.substring(0, 5)} (Actual)
                                            </option>
                                        )}
                                        {horariosDisponibles.map((hora, idx) => (
                                            <option key={idx} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* ✅ CAMBIO 6: Opciones sincronizadas estrictamente con StoreAtencionRequest.php */}
                            <div className="form-group">
                                <label>Tipo Atención</label>
                                <select name="tipo_atencion" value={formData.tipo_atencion} onChange={handleChange}>
                                    <option value="Consulta Externa">Consulta Externa</option>
                                    <option value="Emergencia">Emergencia</option>
                                    <option value="Hospitalización">Hospitalización</option>
                                    <option value="Cirugía">Cirugía</option>
                                    <option value="Procedimiento">Procedimiento</option>
                                    <option value="Control">Control</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cobertura</label>
                                <select name="tipo_cobertura" value={formData.tipo_cobertura} onChange={handleChange}>
                                    <option value="Particular">Particular</option>
                                    <option value="SIS">SIS</option>
                                    <option value="EsSalud">EsSalud</option>
                                    <option value="Privado">Privado</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            {/* === SECCIÓN MARKETING / CANAL DE LLEGADA === */}
                            <div className="form-group" style={{
                                marginTop: '15px',
                                background: '#F9FAFB',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px dashed #D1D5DB'
                            }}>
                                <label style={{ color: '#F59E0B', fontWeight: 'bold' }}>
                                    ¿Por dónde nos contactó el paciente?
                                </label>
                                <select
                                    name="medio_captacion"
                                    value={formData.medio_captacion}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ width: '100%', marginTop: '5px' }}
                                >
                                    <option value="">-- Seleccionar Canal --</option>
                                    <optgroup label="Redes Sociales">
                                        <option value="Instagram Dr. Ivan Pareja">Instagram Dr. Ivan Pareja</option>
                                        <option value="Facebook Dr. Ivan Pareja">Facebook Dr. Ivan Pareja</option>
                                        <option value="Tiktok">TikTok</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                    </optgroup>
                                    <optgroup label="Tradicional">
                                        <option value="Recomendación Paciente">Recomendación de otro Paciente</option>
                                        <option value="Google / Web">Google / Página Web</option>
                                        <option value="Radio">Radio</option>
                                        <option value="TV">TV</option>
                                        <option value="Pasaba por la clínica">Pasaba por la clínica</option>
                                    </optgroup>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Motivo</label>
                        <textarea name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange} rows="2" style={{ width: '100%' }} />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>

                {showPacienteModal && (
                    <PacienteForm
                        onClose={() => setShowPacienteModal(false)}
                        onSuccess={handlePacienteCreado}
                        initialDni={buscarDni}
                    />
                )}
            </div>
        </div>
    );
};

export default FormularioAtencion;