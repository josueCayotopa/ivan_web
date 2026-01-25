import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import Swal from 'sweetalert2';
import pacienteService from '../../../services/pacienteService';

const PacienteForm = ({ dniInicial, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        tipo_documento: 'DNI', // Valor por defecto
        documento_identidad: dniInicial || '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        genero: '', // Campo obligatorio
        telefono: '',
        fecha_nacimiento: '',
        email: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones básicas del frontend
        if (!formData.nombres || !formData.apellido_paterno || !formData.documento_identidad || !formData.genero) {
            Swal.fire('Error', 'Complete los campos obligatorios (*)', 'error');
            setLoading(false);
            return;
        }

        try {
            // Preparamos el payload exacto que pide tu StorePacienteRequest
            const payload = {
                tipo_documento: formData.tipo_documento,
                documento_identidad: formData.documento_identidad,
                nombres: formData.nombres,
                apellido_paterno: formData.apellido_paterno,
                apellido_materno: formData.apellido_materno,
                // Concatenamos nombre completo por si tu backend lo usa (aunque suele ser calculado)
                nombre_completo: `${formData.nombres} ${formData.apellido_paterno} ${formData.apellido_materno}`.trim(),
                genero: formData.genero,
                telefono: formData.telefono,
                fecha_nacimiento: formData.fecha_nacimiento,
                email: formData.email,
                status: true
            };

            const response = await pacienteService.createPaciente(payload);

            if (response.success || response.status === 201 || response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Paciente Registrado',
                    text: 'El paciente ha sido creado exitosamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                // Pasamos el objeto creado al padre
                onSuccess(response.data); 
            } else {
                // Manejo de errores de validación del backend
                const msg = response.errors 
                    ? Object.values(response.errors).flat().join(', ')
                    : (response.message || 'No se pudo crear el paciente');
                Swal.fire('Error', msg, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h3>Registrar Nuevo Paciente</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* FILA 1: DOCUMENTO */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Tipo Documento *</label>
                            <select 
                                name="tipo_documento" 
                                value={formData.tipo_documento} 
                                onChange={handleChange}
                                required
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">Carnet Extranjería</option>
                                <option value="PASAPORTE">Pasaporte</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número Documento *</label>
                            <input 
                                name="documento_identidad" 
                                value={formData.documento_identidad} 
                                onChange={handleChange}
                                maxLength={15}
                                required 
                            />
                        </div>
                    </div>

                    {/* FILA 2: NOMBRES */}
                    <div className="form-group">
                        <label>Nombres *</label>
                        <input name="nombres" value={formData.nombres} onChange={handleChange} required />
                    </div>

                    {/* FILA 3: APELLIDOS */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Apellido Paterno *</label>
                            <input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Apellido Materno</label>
                            <input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
                        </div>
                    </div>

                    {/* FILA 4: GÉNERO Y NACIMIENTO */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Género *</label>
                            <select 
                                name="genero" 
                                value={formData.genero} 
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Seleccione --</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fecha Nacimiento</label>
                            <input 
                                type="date" 
                                name="fecha_nacimiento" 
                                value={formData.fecha_nacimiento} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* FILA 5: CONTACTO */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input 
                                name="telefono" 
                                value={formData.telefono} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

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

export default PacienteForm;