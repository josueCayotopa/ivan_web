// src/components/atenciones/FormularioAtencion.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, User, Calendar, Clock, Stethoscope } from 'lucide-react';
import Swal from 'sweetalert2';
import atencionService from '../../../services/atencionService';
import pacienteService from '../../../services/pacienteService';
import medicoService from '../../../services/medicoService';

const FormularioAtencion = ({ atencion, onClose, onSuccess }) => {
    const esEdicion = !!atencion;
    const [loading, setLoading] = useState(false);
    const [buscandoPaciente, setBuscandoPaciente] = useState(false);
    const [cargandoMedicos, setCargandoMedicos] = useState(true);

    const [medicos, setMedicos] = useState([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

    const [formData, setFormData] = useState({
        paciente_id: '',
        medico_id: '',
        fecha_cita: new Date().toISOString().split('T')[0],
        hora_cita: '',
        tipo_atencion: 'Consulta',
        tipo_cobertura: 'Particular',
        motivo_consulta: '',
        observaciones: '',
        estado: 'pendiente'
    });

    const [buscarDni, setBuscarDni] = useState('');

    useEffect(() => {
        cargarMedicos();

        if (atencion) {
            setFormData({
                paciente_id: atencion.paciente_id || '',
                medico_id: atencion.medico_id || '',
                fecha_cita: atencion.fecha_cita || '',
                hora_cita: atencion.hora_cita || '',
                tipo_atencion: atencion.tipo_atencion || 'Consulta',
                tipo_cobertura: atencion.tipo_cobertura || 'Particular',
                motivo_consulta: atencion.motivo_consulta || '',
                observaciones: atencion.observaciones || '',
                estado: atencion.estado || 'pendiente'
            });
            setPacienteSeleccionado(atencion.paciente);
        }
    }, [atencion]);

    const cargarMedicos = async () => {
        setCargandoMedicos(true);
        try {
            const response = await medicoService.getMedicos(1, '', 100);
            if (response.status === 200) {
                setMedicos(response.data || []);
            }
        } catch (error) {
            console.error('Error cargando médicos:', error);
        } finally {
            setCargandoMedicos(false);
        }
    };

    const handleBuscarPaciente = async () => {
        if (!buscarDni || buscarDni.length < 8) {
            Swal.fire('Error', 'Ingrese un DNI válido (8 dígitos)', 'error');
            return;
        }

        setBuscandoPaciente(true);
        try {
            const response = await pacienteService.searchByDocument(buscarDni);
            
            if (response.success && response.data) {
                setPacienteSeleccionado(response.data);
                setFormData(prev => ({ ...prev, paciente_id: response.data.id }));
                Swal.fire({
                    icon: 'success',
                    title: 'Paciente Encontrado',
                    text: `${response.data.nombres} ${response.data.apellido_paterno}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const result = await Swal.fire({
                    icon: 'question',
                    title: 'Paciente no encontrado',
                    text: '¿Desea registrar un nuevo paciente?',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, registrar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    Swal.fire('Info', 'Por favor, registre al paciente desde el módulo de Pacientes', 'info');
                }
            }
        } catch (error) {
            console.error('Error buscando paciente:', error);
            Swal.fire('Error', 'Error al buscar paciente', 'error');
        } finally {
            setBuscandoPaciente(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pacienteSeleccionado) {
            Swal.fire('Error', 'Debe buscar y seleccionar un paciente', 'error');
            return;
        }

        if (!formData.medico_id) {
            Swal.fire('Error', 'Debe seleccionar un médico', 'error');
            return;
        }

        setLoading(true);

        const payload = {
            paciente_id: formData.paciente_id,
            medico_id: parseInt(formData.medico_id),
            fecha_cita: formData.fecha_cita,
            hora_cita: formData.hora_cita,
            tipo_atencion: formData.tipo_atencion,
            tipo_cobertura: formData.tipo_cobertura,
            motivo_consulta: formData.motivo_consulta,
            observaciones: formData.observaciones,
            estado: formData.estado
        };

        console.log('Enviando payload:', payload);

        try {
            let response;
            if (esEdicion) {
                response = await atencionService.updateAtencion(atencion.id, payload);
            } else {
                response = await atencionService.createAtencion(payload);
            }

            if (response.status === 200 || response.success) {
                Swal.fire({
                    icon: 'success',
                    title: esEdicion ? 'Atención Actualizada' : 'Atención Registrada',
                    text: response.message || 'Operación exitosa',
                    timer: 2000,
                    showConfirmButton: false
                });
                onSuccess();
            } else {
                Swal.fire('Error', response.message || 'Error al procesar', 'error');
            }
        } catch (error) {
            console.error('Error guardando atención:', error);
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h3>{esEdicion ? 'Editar Atención' : 'Nueva Atención'}</h3>
                    <button className="btn-close" onClick={() => onClose()}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* SECCIÓN: BÚSQUEDA DE PACIENTE */}
                    <div className="form-section">
                        <div className="section-label">
                            <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Datos del Paciente
                        </div>

                        <div className="patient-search-row">
                            <div className="form-group">
                                <label>DNI del Paciente *</label>
                                <input
                                    type="text"
                                    value={buscarDni}
                                    onChange={(e) => setBuscarDni(e.target.value)}
                                    placeholder="Ingrese DNI (8 dígitos)"
                                    maxLength={8}
                                    disabled={esEdicion || !!pacienteSeleccionado}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn-search"
                                onClick={handleBuscarPaciente}
                                disabled={buscandoPaciente || esEdicion || !!pacienteSeleccionado}
                            >
                                <Search size={16} />
                                {buscandoPaciente ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>

                        {pacienteSeleccionado && (
                            <div className="patient-selected-card">
                                <div className="patient-card-content">
                                    <h4>
                                        {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellido_paterno} {pacienteSeleccionado.apellido_materno}
                                    </h4>
                                    <div className="patient-card-details">
                                        <span>DNI: {pacienteSeleccionado.documento_identidad}</span>
                                        <span>•</span>
                                        <span>
                                            {pacienteSeleccionado.edad ? `${pacienteSeleccionado.edad} años` : 'Edad no registrada'}
                                        </span>
                                        {pacienteSeleccionado.celular && (
                                            <>
                                                <span>•</span>
                                                <span>Tel: {pacienteSeleccionado.celular}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN: DATOS DE LA ATENCIÓN */}
                    <div className="form-section">
                        <div className="section-label">
                            <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Datos de la Atención
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Médico *</label>
                                {cargandoMedicos ? (
                                    <select disabled>
                                        <option>Cargando...</option>
                                    </select>
                                ) : (
                                    <select
                                        name="medico_id"
                                        value={formData.medico_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione médico</option>
                                        {medicos.map(medico => (
                                            <option key={medico.id} value={medico.id}>
                                                {medico.user?.name || 'Sin nombre'} - {medico.especialidad?.nombre || 'General'}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Fecha de Cita *</label>
                                <input
                                    type="date"
                                    name="fecha_cita"
                                    value={formData.fecha_cita}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora de Cita *</label>
                                <input
                                    type="time"
                                    name="hora_cita"
                                    value={formData.hora_cita}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Tipo de Atención</label>
                                <select
                                    name="tipo_atencion"
                                    value={formData.tipo_atencion}
                                    onChange={handleChange}
                                >
                                    <option value="Consulta">Consulta</option>
                                    <option value="Emergencia">Emergencia</option>
                                    <option value="Control">Control</option>
                                    <option value="Procedimiento">Procedimiento</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tipo de Cobertura</label>
                                <select
                                    name="tipo_cobertura"
                                    value={formData.tipo_cobertura}
                                    onChange={handleChange}
                                >
                                    <option value="Particular">Particular</option>
                                    <option value="SIS">SIS</option>
                                    <option value="EsSalud">EsSalud</option>
                                    <option value="Seguro Privado">Seguro Privado</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="en_atencion">En Atención</option>
                                    <option value="atendida">Atendida</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Motivo de Consulta</label>
                            <textarea
                                name="motivo_consulta"
                                value={formData.motivo_consulta}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describa el motivo de la consulta..."
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Observaciones adicionales..."
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={() => onClose()}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={loading || !pacienteSeleccionado}>
                            {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Registrar Atención'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioAtencion;