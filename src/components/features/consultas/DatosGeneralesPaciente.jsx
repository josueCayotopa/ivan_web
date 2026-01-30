import React from 'react';
import { 
    User, Calendar, MapPin, Phone, Mail, Briefcase, 
    Baby, Heart, Home 
} from 'lucide-react';
import './DatosGeneralesPaciente.css';

const DatosGeneralesPaciente = ({ paciente, atencion, formData, handleChange }) => {
    
    // Si formData no llega (para evitar pantalla blanca de error)
    if (!formData) return <div className="error-box">Cargando datos...</div>;

    // Calcular edad
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return '-';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        return isNaN(date.getTime()) ? fecha : date.toLocaleDateString('es-PE');
    };

    return (
        <div className="datos-generales-container compact-mode">
            {/* HEADER: IDENTIDAD (Estático) */}
            <div className="datos-generales-header compact-header">
                <div className="identity-block">
                    <div className="header-icon"><User size={20} /></div>
                    <div>
                        <h3 className="patient-name">
                            {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                        </h3>
                        <div className="patient-meta">
                            <span>{paciente.tipo_documento}: {paciente.documento_identidad}</span>
                            <span className="separator">•</span>
                            <span>HC: {paciente.numero_historia}</span>
                            <span className="separator">•</span>
                            <span>{calcularEdad(paciente.fecha_nacimiento)} años</span>
                        </div>
                    </div>
                </div>
                
                {/* Datos estáticos secundarios (Lugar Nac, Email) */}
                <div className="secondary-info">
                    <div className="info-row" title="Lugar de Nacimiento">
                        <MapPin size={14} /> 
                        {paciente.lugar_nacimiento || 'Lima'}, {formatearFecha(paciente.fecha_nacimiento)}
                    </div>
                    <div className="info-row" title="Email">
                        <Mail size={14} /> 
                        {paciente.email || paciente.correo_electronico || 'Sin email'}
                    </div>
                </div>
            </div>

            {/* BARRA DE EDICIÓN: CAMPOS DE TRABAJO */}
            <div className="datos-edit-grid">
                
                {/* 1. Teléfonos (Prioridad Celular Editable) */}
                <div className="edit-group">
                    <label><Phone size={13}/> Contacto</label>
                    <div className="multi-input-row">
                        <input 
                            type="text" 
                            className="input-highlight"
                            placeholder="Celular..."
                            value={formData.telefono_consulta || ''}
                            onChange={(e) => handleChange('telefono_consulta', e.target.value)}
                        />
                        <span className="static-ref" title="Casa / Oficina">
                            Telf: {paciente.telefono_domicilio || '-'} / {paciente.telefono_oficina || '-'}
                        </span>
                    </div>
                </div>

                {/* 2. Dirección y Ocupación */}
                <div className="edit-group wide">
                    <label><Home size={13}/> Ubicación & Ocupación</label>
                    <div className="multi-input-row">
                        <input 
                            type="text" 
                            placeholder="Dirección actual..."
                            value={formData.direccion_consulta || ''}
                            onChange={(e) => handleChange('direccion_consulta', e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Ocupación..."
                            style={{width: '40%'}}
                            value={formData.ocupacion_actual || ''}
                            onChange={(e) => handleChange('ocupacion_actual', e.target.value)}
                        />
                    </div>
                </div>

                {/* 3. Datos Sociales (Estado Civil, Hijos) */}
                <div className="edit-group">
                    <label><Heart size={13}/> Social</label>
                    <div className="multi-input-row">
                        <select 
                            value={formData.estado_civil || ''}
                            onChange={(e) => handleChange('estado_civil', e.target.value)}
                            className="select-compact"
                        >
                            <option value="">Est. Civil</option>
                            <option value="Soltero">Soltero</option>
                            <option value="Casado">Casado</option>
                            <option value="Conviviente">Conviviente</option>
                            <option value="Divorciado">Divorciado</option>
                            <option value="Viudo">Viudo</option>
                        </select>
                        <div className="mini-field">
                            <span>Hijos:</span>
                            <input 
                                type="number" 
                                className="input-number"
                                value={formData.cantidad_hijos || ''}
                                onChange={(e) => handleChange('cantidad_hijos', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Ginecobstetricia (Solo Mujeres) */}
                {paciente.genero === 'F' && (
                    <div className="edit-group small">
                        <label><Baby size={13}/> Últ. Embarazo</label>
                        <input 
                            type="text" 
                            placeholder="Año/Fecha"
                            value={formData.ultimo_embarazo || ''}
                            onChange={(e) => handleChange('ultimo_embarazo', e.target.value)}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default DatosGeneralesPaciente;