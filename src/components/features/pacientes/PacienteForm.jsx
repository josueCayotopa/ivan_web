import React, { useState } from 'react';
import { X, Save, MapPin, Phone, User, Briefcase, Heart, Baby } from 'lucide-react'; // Nuevos iconos
import Swal from 'sweetalert2';
import pacienteService from '../../../services/pacienteService';

const PacienteForm = ({ dniInicial, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        // Identificación
        tipo_documento: 'DNI',
        documento_identidad: dniInicial || '',
        genero: '',
        
        // Personales
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        lugar_nacimiento: '',
        ocupacion: '',
        estado_civil: '',      // <--- NUEVO
        cantidad_hijos: '',    // <--- NUEVO
        ultimo_embarazo: '',   // <--- NUEVO
        
        // Contacto
        telefono: '',
        celular: '',
        telefono_domicilio: '',
        telefono_oficina: '',
        email: '',
        correo_electronico: '',
        
        // Ubicación
        direccion: '',
        departamento: '',
        provincia: '',
        distrito: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.nombres || !formData.apellido_paterno || !formData.documento_identidad || !formData.genero) {
            Swal.fire('Error', 'Complete los campos obligatorios (*)', 'error');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                nombre_completo: `${formData.nombres} ${formData.apellido_paterno} ${formData.apellido_materno}`.trim(),
                status: true
            };

            const response = await pacienteService.createPaciente(payload);

            if (response.success || response.status === 201 || response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Paciente Registrado',
                    text: 'Ficha de admisión guardada correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                onSuccess(response.data); 
            } else {
                const msg = response.errors 
                    ? Object.values(response.errors).flat().join(', ')
                    : (response.message || 'No se pudo crear el paciente');
                Swal.fire('Error', msg, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay second-level">
            <div className="modal-content patient-modal fade-in-up" style={{ maxWidth: '850px' }}>
                
                <div className="modal-header">
                    <div>
                        <h3>Registrar Nuevo Paciente</h3>
                        <p style={{fontSize: '0.85rem', color: '#6B7280', margin: 0}}>Ficha de Admisión</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* --- SECCIÓN 1: DATOS PERSONALES --- */}
                    <div className="form-section-group">
                        <h4 className="group-title"><User size={16}/> Datos Personales</h4>
                        
                        {/* Fila Documento y Género */}
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Tipo Doc. *</label>
                                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} required>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">Carnet Ext.</option>
                                    <option value="PASAPORTE">Pasaporte</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Número Doc. *</label>
                                <input name="documento_identidad" value={formData.documento_identidad} onChange={handleChange} maxLength={15} required />
                            </div>
                            <div className="form-group">
                                <label>Género *</label>
                                <select name="genero" value={formData.genero} onChange={handleChange} required>
                                    <option value="">-- Seleccione --</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                        </div>

                        {/* Fila Nombres */}
                        <div className="form-group">
                            <label>Nombres *</label>
                            <input name="nombres" value={formData.nombres} onChange={handleChange} required className="uppercase-input"/>
                        </div>

                        {/* Fila Apellidos */}
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Apellido Paterno *</label>
                                <input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required className="uppercase-input"/>
                            </div>
                            <div className="form-group">
                                <label>Apellido Materno</label>
                                <input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} className="uppercase-input"/>
                            </div>
                        </div>

                        {/* Fila Nacimiento, Lugar y Estado Civil */}
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>F. Nacimiento</label>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Lugar Nacimiento</label>
                                <input name="lugar_nacimiento" value={formData.lugar_nacimiento} onChange={handleChange} placeholder="Ciudad/País" />
                            </div>
                            <div className="form-group">
                                <label>Estado Civil</label> {/* NUEVO */}
                                <select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
                                    <option value="">-- Seleccione --</option>
                                    <option value="Soltero">Soltero(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Conviviente">Conviviente</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viudo">Viudo(a)</option>
                                </select>
                            </div>
                        </div>

                        {/* Fila Ocupación y Familia (Solo si es mujer o relevante) */}
                        <div className="form-grid-3" style={{marginTop: '10px'}}>
                            <div className="form-group">
                                <label>Ocupación</label>
                                <div className="input-with-icon">
                                    <Briefcase size={14} style={{position:'absolute', left:10, top:12, color:'#9CA3AF'}}/>
                                    <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} style={{paddingLeft:30}} placeholder="Ej. Abogado"/>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Cant. Hijos</label> {/* NUEVO */}
                                <input type="number" name="cantidad_hijos" value={formData.cantidad_hijos} onChange={handleChange} placeholder="0" min="0" />
                            </div>

                            {/* Mostrar solo si es Femenino (opcional, aquí lo dejo visible siempre o condicional) */}
                            {formData.genero === 'F' && (
                                <div className="form-group">
                                    <label>Último Embarazo</label> {/* NUEVO */}
                                    <input name="ultimo_embarazo" value={formData.ultimo_embarazo} onChange={handleChange} placeholder="Fecha o Año" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- SECCIÓN 2: CONTACTO Y DOMICILIO --- */}
                    <div className="form-section-group" style={{marginTop: 20}}>
                        <h4 className="group-title"><Phone size={16}/> Contacto y Ubicación</h4>
                        
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Celular</label>
                                <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Principal" />
                            </div>
                            <div className="form-group">
                                <label>Tel. Fijo</label>
                                <input name="telefono_domicilio" value={formData.telefono_domicilio} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dirección Actual</label>
                            <div className="input-with-icon">
                                <MapPin size={14} style={{position:'absolute', left:10, top:12, color:'#9CA3AF'}}/>
                                <input name="direccion" value={formData.direccion} onChange={handleChange} style={{paddingLeft:30}} placeholder="Av. / Calle / Jr..." />
                            </div>
                        </div>

                        <div className="form-grid-3">
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
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Ficha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PacienteForm;