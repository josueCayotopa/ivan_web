import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Eye, Edit2, User, Phone, Mail, Calendar,
    MapPin, FileText, Filter, X, UserPlus, Heart, Users, MessageCircle
} from 'lucide-react';

import Swal from 'sweetalert2';
import pacienteService from '../../services/pacienteService';
import PacienteForm from '../../components/features/pacientes/PacienteForm';
import './Pacientes.css';

const Pacientes = () => {
    // Estados
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagina, setPagina] = useState(1); // <--- FALTABA ESTE ESTADO

    // Estados de Modales
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPaciente, setSelectedPaciente] = useState(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        genero: '',
        tipo_seguro: ''
    });

    useEffect(() => {
        cargarPacientes();
    }, [pagina]); // Recargar si cambia la página

    const cargarPacientes = async () => {
        setLoading(true);
        try {
            // ✅ CORREGIDO: Usamos las variables de estado reales (pagina, searchTerm)
            const response = await pacienteService.getPacientes(pagina, searchTerm);

            console.log("Respuesta Pacientes:", response);

            if (response.success) {
                // Aseguramos que sea un array
                setPacientes(response.data || []);
            } else {
                setPacientes([]);
                console.error("Error cargando pacientes:", response.message);
            }
        } catch (error) {
            setPacientes([]);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        // Al buscar, reiniciamos a la página 1 y cargamos
        if (pagina !== 1) {
            setPagina(1);
        } else {
            cargarPacientes();
        }
    };

    const handleVerDetalle = (paciente) => {
        setSelectedPaciente(paciente);
        setShowDetailModal(true);
    };

    const handleNuevoPaciente = () => {
        setSelectedPaciente(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPaciente(null);
    };

    const handleSuccess = () => {
        setShowModal(false);
        setSelectedPaciente(null);
        cargarPacientes();
    };

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return `${edad} años`;
    };

    // Validación de seguridad para el filtrado
    const listaSegura = Array.isArray(pacientes) ? pacientes : [];

    // Filtrado en cliente
    const pacientesFiltrados = listaSegura.filter(paciente => {
        if (filtros.genero && paciente.genero !== filtros.genero) return false;
        if (filtros.tipo_seguro && paciente.tipo_seguro !== filtros.tipo_seguro) return false;
        return true;
    });

    return (
        <div className="pacientes-container fade-in">

            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Gestión de Pacientes</h2>
                    <p className="page-subtitle">
                        Administra la información de tus pacientes
                    </p>
                </div>

                <button className="btn-create" onClick={handleNuevoPaciente}>
                    <UserPlus size={18} /> Nuevo Paciente
                </button>
            </div>

            {/* ESTADÍSTICAS RÁPIDAS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#E0F2FE' }}>
                        <Users size={24} style={{ color: '#0EA5E9' }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Pacientes</p>
                        <h3 className="stat-value">{pacientes.length}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#FEF3C7' }}>
                        <UserPlus size={24} style={{ color: '#F59E0B' }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Nuevos este mes</p>
                        <h3 className="stat-value">-</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#DCFCE7' }}>
                        <Heart size={24} style={{ color: '#10B981' }} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Activos</p>
                        <h3 className="stat-value"></h3>
                    </div>
                </div>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="filters-card">
                <div className="filters-row">
                    <div className="search-box" style={{ flex: 2 }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o historia clínica..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filtros.genero}
                            onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}
                        >
                            <option value="">Todos los géneros</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filtros.tipo_seguro}
                            onChange={(e) => setFiltros({ ...filtros, tipo_seguro: e.target.value })}
                        >
                            <option value="">Todos los seguros</option>
                            <option value="SIS">SIS</option>
                            <option value="EsSalud">EsSalud</option>
                            <option value="Particular">Particular</option>
                        </select>
                    </div>

                    <button className="btn-search" onClick={handleSearch}>
                        <Search size={16} /> Buscar
                    </button>
                </div>
            </div>

            {/* TABLA DE PACIENTES */}
            {loading ? (
                <div className="loading-section">
                    <div className="spinner"></div>
                    <p>Cargando pacientes...</p>
                </div>
            ) : pacientesFiltrados.length > 0 ? (
                <div className="table-card fade-in-up">
                    <table className="patients-table">
                        <thead>
                            <tr>
                                <th>Historia Clínica</th>
                                <th>Paciente</th>
                                <th>Documento</th>
                                <th>Edad</th>
                                <th>Género</th>
                                <th>Contacto</th>
                                <th>Seguro</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientesFiltrados.map((paciente) => (
                                <tr key={paciente.id}>
                                    <td>
                                        <span className="historia-badge">
                                            {paciente.numero_historia}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="patient-name-cell">
                                           
                                                {`${paciente.nombres || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.trim() || 'Sin Nombre'}
                                           
                                        </div>
                                    </td>
                                    <td>
                                        <span className="dni-badge">
                                            {paciente.tipo_documento}: {paciente.documento_identidad}
                                        </span>
                                    </td>
                                    <td>{calcularEdad(paciente.fecha_nacimiento)}</td>
                                    <td>
                                        <span className={`gender-badge ${paciente.genero === 'M' ? 'male' : 'female'}`}>
                                            {paciente.genero === 'M' ? '♂ Masculino' : '♀ Femenino'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            {/* Verificamos si existe telefono O celular */}
                                            {paciente.telefono || paciente.celular ? (
                                                <a
                                                    /* Usamos el dato que exista, limpiamos espacios y guiones */
                                                    href={`https://wa.me/51${(paciente.telefono || paciente.celular).replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Chat WhatsApp"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: '#15803d', /* Verde oscuro */
                                                        fontWeight: '600',
                                                        textDecoration: 'none',
                                                        background: '#dcfce7', /* Verde claro */
                                                        padding: '6px 10px',
                                                        borderRadius: '20px', /* Bordes redondeados estilo botón */
                                                        border: '1px solid #86efac',
                                                        fontSize: '0.85rem',
                                                        width: 'fit-content'
                                                    }}
                                                >
                                                    <MessageCircle size={16} />
                                                    {paciente.telefono || paciente.celular}
                                                </a>
                                            ) : (
                                                <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="seguro-badge">
                                            {paciente.tipo_seguro || 'Particular'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${paciente.status ? 'active' : 'inactive'}`}>
                                            {paciente.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleVerDetalle(paciente)}
                                            title="Ver detalles"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <User size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
                    <p>No se encontraron pacientes</p>
                    <button className="btn-create" onClick={handleNuevoPaciente}>
                        <UserPlus size={18} /> Registrar Primer Paciente
                    </button>
                </div>
            )}

            {/* MODAL DE DETALLE */}
            {showDetailModal && selectedPaciente && (
                <DetalleModal
                    paciente={selectedPaciente}
                    onClose={() => setShowDetailModal(false)}
                    calcularEdad={calcularEdad}
                />
            )}

            {/* MODAL DE FORMULARIO */}
            {showModal && (
                <PacienteForm
                    dniInicial=""
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

// Componente de Modal de Detalle
const DetalleModal = ({ paciente, onClose, calcularEdad }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
                <div className="modal-header">
                    <h3>Información del Paciente</h3>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '28px' }}>
                    {/* Información Principal */}
                    <div className="detail-section">
                        <div className="detail-header">
                            <div className="patient-avatar-large">
                                {paciente.nombres?.charAt(0)}{paciente.apellido_paterno?.charAt(0)}
                            </div>
                            <div>
                                <h2 style={{ margin: '0 0 8px 0', color: '#111827' }}>
                                    {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
                                </h2>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <span className="historia-badge">{paciente.numero_historia}</span>
                                    <span className="dni-badge">
                                        {paciente.tipo_documento}: {paciente.documento_identidad}
                                    </span>
                                    <span className={`status-badge ${paciente.status ? 'active' : 'inactive'}`}>
                                        {paciente.status ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información Personal */}
                    <div className="detail-section">
                        <h4 className="section-title">
                            <User size={18} /> Información Personal
                        </h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Fecha de Nacimiento:</span>
                                <span className="detail-value">
                                    {paciente.fecha_nacimiento
                                        ? new Date(paciente.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })
                                        : 'No especificada'
                                    }
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Edad:</span>
                                <span className="detail-value">{calcularEdad(paciente.fecha_nacimiento)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Género:</span>
                                <span className="detail-value">
                                    {paciente.genero === 'M' ? 'Masculino' : 'Femenino'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Grupo Sanguíneo:</span>
                                <span className="detail-value">{paciente.grupo_sanguineo || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="detail-section">
                        <h4 className="section-title">
                            <Phone size={18} /> Información de Contacto
                        </h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Teléfono Principal:</span>
                                <span className="detail-value">{paciente.telefono || 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Celular:</span>
                                <span className="detail-value">{paciente.celular || 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{paciente.email || 'No especificado'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Dirección:</span>
                                <span className="detail-value">{paciente.direccion || 'No especificada'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información de Seguro */}
                    <div className="detail-section">
                        <h4 className="section-title">
                            <FileText size={18} /> Información de Seguro
                        </h4>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">Tipo de Seguro:</span>
                                <span className="detail-value">{paciente.tipo_seguro || 'Particular'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Número de Seguro:</span>
                                <span className="detail-value">{paciente.numero_seguro || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Médica */}
                    {(paciente.alergias || paciente.antecedentes_personales || paciente.antecedentes_familiares) && (
                        <div className="detail-section">
                            <h4 className="section-title">
                                <Heart size={18} /> Información Médica
                            </h4>
                            {paciente.alergias && (
                                <div className="detail-item-full">
                                    <span className="detail-label">Alergias:</span>
                                    <p className="detail-text">{paciente.alergias}</p>
                                </div>
                            )}
                            {paciente.antecedentes_personales && (
                                <div className="detail-item-full">
                                    <span className="detail-label">Antecedentes Personales:</span>
                                    <p className="detail-text">{paciente.antecedentes_personales}</p>
                                </div>
                            )}
                            {paciente.antecedentes_familiares && (
                                <div className="detail-item-full">
                                    <span className="detail-label">Antecedentes Familiares:</span>
                                    <p className="detail-text">{paciente.antecedentes_familiares}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pacientes;