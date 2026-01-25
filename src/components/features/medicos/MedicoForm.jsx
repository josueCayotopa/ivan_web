// src/components/medicos/MedicoForm.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import medicoService from '../../../services/medicoService';
import especialidadService from '../../../services/especialidadService';

const MedicoForm = ({ medico, onClose, onSuccess }) => {
    const isEditing = !!medico;
    const [loading, setLoading] = useState(false);
    const [especialidades, setEspecialidades] = useState([]);
    const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        dni: '',
        cmp: '',
        username: '',
        email: '',
        password: '',
        rne: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
        id_especialidad: ''
    });

    useEffect(() => {
        // ✅ CARGAR ESPECIALIDADES AL MONTAR EL COMPONENTE
        loadEspecialidades();

        // Si estamos editando, cargar datos del médico
        if (medico) {
            const nombreCompleto = medico.user?.name || '';
            const primerEspacio = nombreCompleto.indexOf(' ');

            let nombreInit = '';
            let apellidoInit = '';

            if (primerEspacio === -1) {
                nombreInit = nombreCompleto;
            } else {
                nombreInit = nombreCompleto.substring(0, primerEspacio);
                apellidoInit = nombreCompleto.substring(primerEspacio + 1);
            }

            setFormData({
                nombres: nombreInit,
                apellidos: apellidoInit,
                email: medico.user?.email || '',
                password: '',
                username: medico.user?.username || '',
                id: medico.id,
                dni: medico.documento_identidad || '',
                cmp: medico.numero_colegiatura || '',
                rne: medico.rne || '',
                telefono: medico.telefono || medico.user?.phone || '',
                direccion: medico.direccion || '',
                fecha_nacimiento: medico.fecha_nacimiento || '',
                id_especialidad: medico.especialidad_id || ''
            });
        }
    }, [medico]);

    // ✅ FUNCIÓN PARA CARGAR ESPECIALIDADES
    const loadEspecialidades = async () => {
        setLoadingEspecialidades(true);
        try {
            console.log('Cargando especialidades...'); // DEBUG
            const response = await especialidadService.getEspecialidadesActivas();
            console.log('Response especialidades:', response); // DEBUG

            if (response.status === 200 && response.data) {
                setEspecialidades(response.data);
                console.log('Especialidades cargadas:', response.data.length); // DEBUG
            } else {
                console.error('Error en response:', response);
                Swal.fire('Advertencia', 'No se pudieron cargar las especialidades', 'warning');
            }
        } catch (error) {
            console.error('Error loading especialidades:', error);
            Swal.fire('Error', 'Error al cargar especialidades', 'error');
        } finally {
            setLoadingEspecialidades(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const nombreCompleto = `${formData.nombres} ${formData.apellidos}`.trim();

        const payload = {
            nombre_completo: nombreCompleto,
            email: formData.email,
            username: formData.username,
            telefono: formData.telefono,
            documento_identidad: formData.dni,
            numero_colegiatura: formData.cmp,
            rne: formData.rne,
            direccion: formData.direccion,
            fecha_nacimiento: formData.fecha_nacimiento,
            especialidad_id: parseInt(formData.id_especialidad), // ✅ Convertir a número
            status: true
        };

        // Si no estamos editando y hay password, agregarlo
        if (!isEditing && formData.password) {
            payload.password = formData.password;
        }
        console.log('Enviando payload:', payload); // DEBUG

        try {
            let res;
            if (isEditing) {
                res = await medicoService.updateMedico(medico.id, payload);
            } else {
                res = await medicoService.createMedico(payload);
            }

            if (res.status === 200 || res.status === 201 || res.success) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Médico Actualizado' : 'Médico Registrado',
                    text: res.message || 'Operación exitosa',
                    showConfirmButton: false,
                    timer: 2000
                });
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const errorMsg = res.message || 'Error al procesar';
                Swal.fire('Error', errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error en submit:', error);
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h3>{isEditing ? 'Editar Médico' : 'Nuevo Médico'}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombres *</label>
                            <input name="nombres" value={formData.nombres} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Apellidos *</label>
                            <input name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Correo Electrónico *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nombre de Usuario *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Ej: drjuanperez"
                                required
                                pattern="^[a-zA-Z0-9_-]+$" // Validación visual para evitar errores
                                title="Solo letras, números, guiones y guiones bajos (sin espacios ni puntos)"
                            />
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Sin espacios ni puntos. Ej: juan_perez
                            </small>
                        </div>
                        {!isEditing && (
                            <div className="form-group">
                                <label>Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                />
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Si lo dejas vacío, el sistema asignará una automática.
                                </small>
                            </div>
                        )}

                        <div className="form-group">
                            <label>DNI *</label>
                            <input name="dni" value={formData.dni} onChange={handleChange} maxLength={8} required />
                        </div>

                        <div className="form-group">
                            <label>CMP *</label>
                            <input name="cmp" value={formData.cmp} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>RNE (Opcional)</label>
                            <input name="rne" value={formData.rne} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Teléfono</label>
                            <input name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Especialidad *</label>
                            {loadingEspecialidades ? (
                                <select disabled>
                                    <option>Cargando...</option>
                                </select>
                            ) : (
                                <select
                                    name="id_especialidad"
                                    value={formData.id_especialidad}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {especialidades.map(esp => (
                                        <option key={esp.id} value={esp.id}>
                                            {esp.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {especialidades.length === 0 && !loadingEspecialidades && (
                                <small className="text-muted" style={{ fontSize: '0.75rem', color: 'red' }}>
                                    No hay especialidades disponibles
                                </small>
                            )}
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

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Dirección</label>
                        <input
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={loading || loadingEspecialidades}>
                            {loading ? 'Guardando...' : 'Guardar Médico'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicoForm;