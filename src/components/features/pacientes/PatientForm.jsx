import React, { useState, useEffect } from 'react';
import { X, UserPlus, MapPin, Activity } from 'lucide-react';
import Swal from 'sweetalert2';
import patientService from '../../../services/pacienteService.js';

const PatientForm = ({ patient, onClose, onSuccess }) => {
    const isEditing = !!patient;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const [formData, setFormData] = useState({
        nombres: '', apellido_paterno: '', apellido_materno: '',
        tipo_documento: 'DNI', documento_identidad: '',
        fecha_nacimiento: '', genero: '', grupo_sanguineo: '',
        telefono: '', celular: '', email: '',
        direccion: '', departamento: '', provincia: '', distrito: '', lugar_nacimiento: '',
        ocupacion: '',
        tipo_seguro: 'Particular', numero_seguro: '',
        alergias: '', antecedentes_personales: ''
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                id: patient.id,
                nombres: patient.nombres || '',
                apellido_paterno: patient.apellido_paterno || '',
                apellido_materno: patient.apellido_materno || '',
                tipo_documento: patient.tipo_documento || 'DNI',
                documento_identidad: patient.documento_identidad || patient.numero_documento || '',
                fecha_nacimiento: patient.fecha_nacimiento ? patient.fecha_nacimiento.split('T')[0] : '',
                genero: patient.genero || '',
                grupo_sanguineo: patient.grupo_sanguineo || '',
                telefono: patient.telefono || '',
                celular: patient.celular || '',
                email: patient.email || '',
                direccion: patient.direccion || '',
                departamento: patient.departamento || '',
                provincia: patient.provincia || '',
                distrito: patient.distrito || '',
                lugar_nacimiento: patient.lugar_nacimiento || '',
                ocupacion: patient.ocupacion || '',
                tipo_seguro: patient.tipo_seguro || 'Particular',
                numero_seguro: patient.numero_seguro || '',
                alergias: patient.alergias || '',
                antecedentes_personales: patient.antecedentes_personales || ''
            });
        }
    }, [patient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación completa
        if (!formData.nombres || !formData.apellido_paterno || !formData.documento_identidad || !formData.fecha_nacimiento || !formData.genero) {
            Swal.fire('Campos incompletos', 'Por favor complete: Nombres, Apellidos, DNI, Fecha Nacimiento y Género', 'warning');
            return;
        }

        setLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await patientService.updatePatient(formData);
            } else {
                res = await patientService.createPatient(formData);
            }

            if (res.success || res.id || res.data?.id) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Paciente Actualizado' : 'Paciente Registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
                onSuccess(); // Recargar tabla
                onClose();   // Cerrar modal
            } else {
                // Mostrar error específico del backend si existe
                const mensajeError = res.message || 'No se pudo guardar el registro';
                Swal.fire('Atención', mensajeError, 'warning');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content premium-modal" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>{isEditing ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-tabs">
                    <button type="button" className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                        <UserPlus size={16} /> Datos Personales
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === 'contacto' ? 'active' : ''}`} onClick={() => setActiveTab('contacto')}>
                        <MapPin size={16} /> Contacto
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === 'medico' ? 'active' : ''}`} onClick={() => setActiveTab('medico')}>
                        <Activity size={16} /> Clínicos
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {activeTab === 'personal' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombres *</label>
                                <input name="nombres" value={formData.nombres} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Apellido Paterno *</label>
                                <input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Apellido Materno</label>
                                <input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Tipo Doc.</label>
                                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">Carnet Ext.</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>N° Documento *</label>
                                <input name="documento_identidad" value={formData.documento_identidad} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Fecha Nacimiento</label>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Género</label>
                                <select name="genero" value={formData.genero} onChange={handleChange}>
                                    <option value="">Seleccione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ocupación</label>
                                <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contacto' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Celular</label>
                                <input name="celular" value={formData.celular} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Dirección</label>
                                <input name="direccion" value={formData.direccion} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Departamento</label>
                                <input name="departamento" value={formData.departamento} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Provincia</label>
                                <input name="provincia" value={formData.provincia} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Distrito</label>
                                <input name="distrito" value={formData.distrito} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'medico' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo Seguro</label>
                                <select name="tipo_seguro" value={formData.tipo_seguro} onChange={handleChange}>
                                    <option value="Particular">Particular</option>
                                    <option value="SIS">SIS</option>
                                    <option value="EsSalud">EsSalud</option>
                                    <option value="Privado">Privado</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Grupo Sanguíneo</label>
                                <select name="grupo_sanguineo" value={formData.grupo_sanguineo} onChange={handleChange}>
                                    <option value="">Desconocido</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Alergias</label>
                                <textarea name="alergias" value={formData.alergias} onChange={handleChange} rows="2" className="w-full border p-2 rounded"></textarea>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Antecedentes</label>
                                <textarea name="antecedentes_personales" value={formData.antecedentes_personales} onChange={handleChange} rows="3" className="w-full border p-2 rounded"></textarea>
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;