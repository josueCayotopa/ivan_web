import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Phone, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import patientService from '../../services/pacienteService.js';
import PatientForm from '../../components/features/pacientes/PatientForm';
import './Pacientes.css';

const Pacientes = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [perPage] = useState(10);

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Filtros
    const [filters, setFilters] = useState({ genero: '', tipo_seguro: '' });

    const fetchPatients = async (page = 1, search = '', currentFilters = null) => {
        setLoading(true);
        const activeFilters = currentFilters || filters;
        try {
            const response = await patientService.getPatients(page, search, perPage, activeFilters);
            if (response.success) {
                setPatients(response.data);
                setTotalPages(Math.ceil(response.total / perPage));
                setCurrentPage(page);
            } else {
                setPatients([]);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar los pacientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchPatients(newPage, searchTerm);
        }
    };

    const handleViewHistory = (patient) => {
        navigate(`/dashboard/historia/${patient.id}`);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        fetchPatients(1, term);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        fetchPatients(1, searchTerm, newFilters);
    };

    const handleOpenModal = (patient = null) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar paciente?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                const res = await patientService.deletePatient(id);
                if (res.success) {
                    Swal.fire('Eliminado', 'Paciente eliminado correctamente', 'success');
                    fetchPatients(searchTerm);
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
        }
    };

    return (
        <div className="pacientes-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Gestión de Pacientes</h2>
                    <p className="page-subtitle">Directorio de historias clínicas y datos personales</p>
                </div>
                <button className="btn-create" onClick={() => handleOpenModal(null)}>
                    <Plus size={18} /> Nuevo Paciente
                </button>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI o Historia..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="filters-group">
                    <select name="genero" value={filters.genero} onChange={handleFilterChange} className="filter-select">
                        <option value="">Género: Todos</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    <select name="tipo_seguro" value={filters.tipo_seguro} onChange={handleFilterChange} className="filter-select">
                        <option value="">Seguro: Todos</option>
                        <option value="Particular">Particular</option>
                        <option value="SIS">SIS</option>
                        <option value="EsSalud">EsSalud</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="table-container fade-in">
                {loading ? (
                    <div className="loading-state">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Cargando pacientes...</p>
                    </div>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Documento</th>
                                <th>Datos</th>
                                <th>Contacto</th>
                                <th>Seguro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length > 0 ? patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <div className="patient-cell">
                                            <div className="avatar-circle">
                                                {patient.nombres ? patient.nombres.charAt(0) : 'P'}
                                            </div>
                                            <div>
                                                <div className="font-bold">{patient.nombres} {patient.apellido_paterno}</div>
                                                <div className="text-muted text-xs">HC: {patient.numero_historia || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{patient.tipo_documento}</span>
                                            <span className="text-muted">{patient.numero_documento || patient.documento_identidad}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span>{patient.genero === 'M' ? 'Masc.' : patient.genero === 'F' ? 'Fem.' : '-'}</span>
                                            <span className="text-muted text-xs">{patient.fecha_nacimiento}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <Phone size={14} className="text-muted" />
                                            <span>{patient.celular || patient.telefono || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${patient.tipo_seguro === 'SIS' ? 'active' : 'pendiente'}`}>
                                            {patient.tipo_seguro || 'Particular'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-icon view" title="Ver Historia" onClick={() => handleViewHistory(patient)}><Eye size={18} /></button>
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(patient)} title="Editar"><Edit size={18} /></button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(patient.id)} title="Eliminar"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-muted">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span className="text-sm text-muted">
                    Página {currentPage} de {totalPages || 1}
                </span>
                <div className="pagination-controls" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn-pagination"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: currentPage === 1 ? '#f5f5f5' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Anterior
                    </button>
                    <button
                        className="btn-pagination"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => handlePageChange(currentPage + 1)}
                        style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', background: currentPage === totalPages ? '#f5f5f5' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {showModal && (
                <PatientForm
                    patient={selectedPatient}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => fetchPatients(searchTerm)}
                />
            )}
        </div>
    );
};

export default Pacientes;