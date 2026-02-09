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
    const [medicoUnico, setMedicoUnico] = useState(null);

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
        hora_ingreso: '09:00', // Hora por defecto para simplificar
        tipo_atencion: 'Consulta Externa',
        tipo_cobertura: 'Particular',
        motivo_consulta: '',
        observaciones: '',
        medio_captacion: '',
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
                setFormData(prev => ({
                    ...prev,
                    ...atencion,
                    fecha_atencion: atencion.fecha_atencion?.split('T')[0] || prev.fecha_atencion,
                    hora_ingreso: atencion.hora_ingreso?.substring(0, 5) || '09:00'
                }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pacienteSeleccionado) {
            Swal.fire('Atención', 'Debe seleccionar un paciente', 'warning');
            return;
        }
        setLoading(true);
        try {
            const response = esEdicion
                ? await atencionService.updateAtencion(atencion.id, formData)
                : await atencionService.createAtencion(formData);

            if (response.success || response.data) {
                Swal.fire({ icon: 'success', title: 'Atención guardada', timer: 1500, showConfirmButton: false });
                onSuccess();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar la atención', 'error');
        } finally { setLoading(false); }
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

                            <div className="form-group">
                                <label>Hora Aproximada</label>
                                <input
                                    type="time"
                                    name="hora_ingreso"
                                    value={formData.hora_ingreso}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Medio de Captación</label>
                                <select name="medio_captacion" value={formData.medio_captacion} onChange={handleChange} className="form-control">
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Recomendación">Recomendación</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label>Motivo de Consulta / Observaciones</label>
                            <textarea
                                name="motivo_consulta"
                                value={formData.motivo_consulta}
                                onChange={handleChange}
                                rows="3"
                                className="form-control"
                                placeholder="Ej: Rinoplastia, control post-operatorio..."
                                style={{ width: '100%', padding: '10px' }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading} style={{ background: '#F59E0B', color: 'white', padding: '10px 25px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
                            {loading ? 'Guardando...' : esEdicion ? 'Actualizar Atención' : 'Confirmar Atención'}
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