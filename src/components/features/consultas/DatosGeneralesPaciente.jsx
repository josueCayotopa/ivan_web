import React from 'react';
import { User, Calendar, MapPin, Phone, Heart, Mail, Briefcase } from 'lucide-react';
import './DatosGeneralesPaciente.css';

const DatosGeneralesPaciente = ({ paciente, atencion }) => {
    // Calcular edad
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="datos-generales-container">
            {/* Título de la sección */}
            <div className="datos-generales-header">
                <div className="header-icon">
                    <User size={24} />
                </div>
                <h3>DATOS GENERALES (Por favor con letra impresa)</h3>
            </div>

            {/* Grid de datos */}
            <div className="datos-grid">
                
                {/* FILA 1: Nombre Completo y Lugar de Nacimiento */}
                <div className="dato-item dato-full-width">
                    <label className="dato-label">
                        <User size={16} />
                        Nombre y Apellidos:
                    </label>
                    <div className="dato-value dato-resaltado">
                        {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                    </div>
                </div>

                <div className="dato-item">
                    <label className="dato-label">
                        <MapPin size={16} />
                        Lugar y Fecha de Nacimiento:
                    </label>
                    <div className="dato-value">
                        {paciente.lugar_nacimiento || 'No especificado'}, {formatearFecha(paciente.fecha_nacimiento)}
                    </div>
                </div>

                {/* FILA 2: Edad, Estado Civil, Hijos, Último Embarazo */}
                <div className="dato-item dato-small">
                    <label className="dato-label">
                        <Calendar size={16} />
                        Edad:
                    </label>
                    <div className="dato-value dato-edad">
                        {calcularEdad(paciente.fecha_nacimiento)} años
                    </div>
                </div>

                <div className="dato-item dato-small">
                    <label className="dato-label">Estado Civil:</label>
                    <div className="dato-value dato-input">
                        _________________
                    </div>
                </div>

                <div className="dato-item dato-small">
                    <label className="dato-label">Cantidad de Hijos:</label>
                    <div className="dato-value dato-input">
                        _________________
                    </div>
                </div>

                <div className="dato-item dato-small">
                    <label className="dato-label">Último Embarazo:</label>
                    <div className="dato-value dato-input">
                        _________________
                    </div>
                </div>

                {/* FILA 3: Celular, Teléfono Domicilio, Teléfono Oficina */}
                <div className="dato-item">
                    <label className="dato-label">
                        <Phone size={16} />
                        Celular:
                    </label>
                    <div className="dato-value">
                        {paciente.celular || paciente.telefono || 'No especificado'}
                    </div>
                </div>

                <div className="dato-item">
                    <label className="dato-label">
                        <Phone size={16} />
                        Teléfono Domicilio:
                    </label>
                    <div className="dato-value">
                        {paciente.telefono_domicilio || 'No especificado'}
                    </div>
                </div>

                <div className="dato-item">
                    <label className="dato-label">
                        <Phone size={16} />
                        Teléfono Oficina:
                    </label>
                    <div className="dato-value">
                        {paciente.telefono_oficina || 'No especificado'}
                    </div>
                </div>

                {/* FILA 4: DNI y Carnet de Extranjería */}
                <div className="dato-item">
                    <label className="dato-label">
                        DNI ( ) Nº:
                    </label>
                    <div className="dato-value">
                        {paciente.tipo_documento === 'DNI' ? paciente.documento_identidad : '_______________'}
                    </div>
                </div>

                <div className="dato-item">
                    <label className="dato-label">
                        Carnet de Extranjería ( ) Nº:
                    </label>
                    <div className="dato-value">
                        {paciente.tipo_documento === 'CE' ? paciente.documento_identidad : '_______________'}
                    </div>
                </div>

                {/* FILA 5: Dirección Actual */}
                <div className="dato-item dato-full-width">
                    <label className="dato-label">
                        <MapPin size={16} />
                        Dirección Actual:
                    </label>
                    <div className="dato-value">
                        {paciente.direccion || 'No especificada'}
                        {paciente.distrito && `, ${paciente.distrito}`}
                        {paciente.provincia && `, ${paciente.provincia}`}
                        {paciente.departamento && `, ${paciente.departamento}`}
                    </div>
                </div>

                {/* FILA 6: Ocupación */}
                <div className="dato-item dato-full-width">
                    <label className="dato-label">
                        <Briefcase size={16} />
                        Ocupación:
                    </label>
                    <div className="dato-value">
                        {paciente.ocupacion || 'No especificada'}
                    </div>
                </div>

                {/* FILA 7: Email */}
                <div className="dato-item dato-full-width">
                    <label className="dato-label">
                        <Mail size={16} />
                        Email:
                    </label>
                    <div className="dato-value">
                        {paciente.email || paciente.correo_electronico || 'No especificado'}
                    </div>
                </div>
            </div>

            {/* Información de la atención actual */}
            <div className="atencion-info">
                <div className="atencion-badge">
                    <Calendar size={16} />
                    <span>
                        Atención: {new Date(atencion.fecha_atencion).toLocaleDateString('es-PE')} 
                        - {atencion.hora_ingreso?.substring(0,5)}
                    </span>
                </div>
                <div className="atencion-badge">
                    <Heart size={16} />
                    <span>Historia Clínica: {paciente.numero_historia}</span>
                </div>
                {atencion.medico?.user?.name && (
                    <div className="atencion-badge">
                        <User size={16} />
                        <span>Médico: {atencion.medico.user.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatosGeneralesPaciente;