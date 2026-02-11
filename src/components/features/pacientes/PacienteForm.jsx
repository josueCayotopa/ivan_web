// src/components/features/pacientes/PacienteForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Heart, Baby } from 'lucide-react'; // Iconos sugeridos
import Swal from 'sweetalert2';
import pacienteService from '../../../services/pacienteService';

const PacienteForm = ({ paciente, onClose, onSuccess, initialDni = '' }) => {
    const isEditing = !!paciente;
    const [loading, setLoading] = useState(false);

    // Estado inicial
    const [formData, setFormData] = useState({
        // Identificación
        tipo_documento: 'DNI',
        documento_identidad: initialDni || '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        genero: 'M',

        // Contacto
        telefono: '',
        email: '',
        direccion: '',
        ocupacion: '',

        // ✅ NUEVOS CAMPOS SOCIALES
        estado_civil: '',
        cantidad_hijos: 0,
        ultimo_embarazo: '', // Solo para mujeres

        // Antecedentes rápidos (Opcional si los manejas aquí)
        alergias: '',
    });
    // Dentro de PacienteForm.jsx

    const [buscandoExterno, setBuscandoExterno] = useState(false);

    // Dentro de PacienteForm.jsx

    const handleConsultarDniApi = async () => {
        const dni = formData.documento_identidad;
        if (dni.length !== 8) {
            Swal.fire('Atención', 'Ingrese un DNI válido de 8 dígitos', 'warning');
            return;
        }

        setBuscandoExterno(true);
        try {
            const resultado = await pacienteService.buscarDniExterno(dni);

            if (resultado.success && resultado.data) {
                // Mapeo exacto según la documentación de la API
                setFormData(prev => ({
                    ...prev,
                    nombres: resultado.data.first_name || '',           // Nombres
                    apellido_paterno: resultado.data.first_last_name || '', // Apellido Paterno
                    apellido_materno: resultado.data.second_last_name || '', // Apellido Materno
                }));

                Swal.fire({
                    icon: 'success',
                    title: 'Datos recuperados',
                    text: `Paciente: ${resultado.data.first_name}`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Error', 'No se encontraron datos para este DNI', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema con la conexión', 'error');
        } finally {
            setBuscandoExterno(false);
        }
    };

    // Cargar datos si es edición
    useEffect(() => {
        if (paciente) {
            setFormData({
                // Identificación (Ya funciona)
                tipo_documento: paciente.tipo_documento || 'DNI',
                documento_identidad: paciente.documento_identidad || '',
                nombres: paciente.nombres || '',
                apellido_paterno: paciente.apellido_paterno || '',
                apellido_materno: paciente.apellido_materno || '',
                fecha_nacimiento: paciente.fecha_nacimiento
                    ? paciente.fecha_nacimiento.substring(0, 10)
                    : '',

                // ✅ SECCIÓN SOCIAL Y CONTACTO (CORREGIDA)
                genero: paciente.genero || 'M',
                estado_civil: paciente.estado_civil || '',
                ocupacion: paciente.ocupacion || '',

                // Asegúrate de usar 'cantidad_hijos' como en tu modelo Pacientes.php
                cantidad_hijos: paciente.cantidad_hijos || 0,
                ultimo_embarazo: paciente.ultimo_embarazo || '',

                // Tu tabla usa 'telefono' y 'celular', mapeamos al campo del form
                telefono: paciente.telefono || paciente.celular || '',

                email: paciente.email || '',
                direccion: paciente.direccion || '',
                alergias: paciente.alergias || ''

            });
        }
    }, [paciente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (isEditing) {
                // Enviamos el ID junto con los datos actualizados
                response = await pacienteService.updatePaciente({
                    id: paciente.id,
                    ...formData
                });
            } else {
                response = await pacienteService.createPaciente(formData);
            }

            if (response.success) {
                Swal.fire('Éxito', isEditing ? 'Paciente actualizado' : 'Paciente creado', 'success');
                onSuccess(); // Esto refresca la lista en el componente padre
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* SECCIÓN 1: IDENTIFICACIÓN */}
                    <div className="form-section">
                        <h4 className="subsection-title"><User size={16} /> Datos Personales</h4>
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Tipo Doc. *</label>
                                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} required>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">Carnet Ext.</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nro. Documento *</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        name="documento_identidad"
                                        value={formData.documento_identidad}
                                        onChange={handleChange}
                                        maxLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleConsultarDniApi}
                                        disabled={buscandoExterno}
                                        className="btn-search"
                                        style={{ padding: '0 12px', background: '#3b82f6', color: 'white', borderRadius: '4px' }}
                                    >
                                        {buscandoExterno ? '...' : 'Consultar'}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fecha Nacimiento *</label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-grid-3">
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
                        </div>
                    </div>

                    {/* SECCIÓN 2: DATOS SOCIALES Y CONTACTO */}
                    <div className="form-section" style={{ marginTop: '20px' }}>
                        <h4 className="subsection-title"><Heart size={16} /> Información Social y Contacto</h4>

                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Género *</label>
                                <select name="genero" value={formData.genero} onChange={handleChange} required>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            {/* ✅ NUEVO: ESTADO CIVIL */}
                            <div className="form-group">
                                <label>Estado Civil</label>
                                <select name="estado_civil" value={formData.estado_civil} onChange={handleChange}>
                                    <option value="">Seleccione...</option>
                                    <option value="Soltero">Soltero(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Conviviente">Conviviente</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viudo">Viudo(a)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ocupación</label>
                                <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-grid-3">
                            {/* ✅ NUEVO: CANTIDAD DE HIJOS */}
                            <div className="form-group">
                                <label>Hijos</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Baby size={18} color="#6B7280" />
                                    <input
                                        type="number"
                                        name="cantidad_hijos"
                                        value={formData.cantidad_hijos}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* ✅ NUEVO: ÚLTIMO EMBARAZO (SOLO MUJERES) */}
                            {formData.genero === 'F' && (
                                <div className="form-group">
                                    <label>Último Embarazo (Fecha/Año)</label>
                                    <input
                                        type="text"
                                        name="ultimo_embarazo"
                                        value={formData.ultimo_embarazo}
                                        onChange={handleChange}
                                        placeholder="Ej: 2018 o 12/05/2020"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Celular / Teléfono</label>
                                <input name="telefono" value={formData.telefono} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dirección</label>
                            <input name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Paciente' : 'Guardar Paciente')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PacienteForm;