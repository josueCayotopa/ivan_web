// src/page/dashboard/Medicos.jsx
import React, { useState, useEffect } from 'react';
import './Medicos.css'; // Asegúrate de crear este archivo o importar tus estilos globales
import { Stethoscope, Edit, Ban, CheckCircle, Plus, Calendar, Search } from 'lucide-react';
import medicoService from "../../services/medicoService";
import Swal from 'sweetalert2';
import MedicoForm from '../../components/features/medicos/MedicoForm.jsx';
import HorarioManager from '../../components/features/medicos/HorarioManager';

const Medicos = () => {
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');

    // Modales
    const [showFormModal, setShowFormModal] = useState(false);
    const [showHorarioModal, setShowHorarioModal] = useState(false);
    const [selectedMedico, setSelectedMedico] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Asumiendo paginación 1, búsqueda vacía, 100 registros (o ajusta tu paginación)
            const response = await medicoService.getMedicos(1, '', 20);
            if (response.status === 200) {
                // Ajusta esto según si tu API devuelve data.data o data array directo
                setMedicos(Array.isArray(response.data) ? response.data : response.data.data || []);
            }
        } catch (err) {
            console.error('Error loading medicos:', err);
            setError('Error al cargar la lista de médicos.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (medico = null) => {
        setSelectedMedico(medico);
        setShowFormModal(true);
    };

    const handleOpenHorario = (medico) => {
        setSelectedMedico(medico);
        setShowHorarioModal(true);
    };

    const handleCloseModals = (shouldReload = false) => {
        setShowFormModal(false);
        setShowHorarioModal(false);
        setSelectedMedico(null);
        if (shouldReload) loadData();
    };

    const handleToggleStatus = async (medico) => {
        // CORREGIDO: Usamos 'status' (booleano) en lugar de 'estado' (1/0)
        const isActive = medico.status;

        const action = isActive ? 'Desactivar' : 'Activar';
        const newStatus = !isActive; // Simplemente invertimos el booleano

        const result = await Swal.fire({
            title: `¿${action} médico?`,
            text: `El médico ${medico.nombres} será ${action.toLowerCase()}do.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#FFC107'
        });

        if (result.isConfirmed) {
            try {
                // Enviamos el nuevo status
                await medicoService.toggleStatus(medico.id, newStatus);
                loadData();
                Swal.fire('Actualizado', `El estado ha sido cambiado.`, 'success');
            } catch (err) {
                Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
            }
        }
    };

    // Filtrado local (o puedes usar la búsqueda del backend)
    const filteredMedicos = medicos.filter((m) => {
        const q = searchText.trim().toLowerCase();
        if (!q) return true;
        const fullName = `${m.nombres} ${m.apellidos}`.toLowerCase();
        return fullName.includes(q) || m.cmp?.includes(q);
    });

    return (
        <div className="medicos-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Gestión de Médicos</h2>
                    <p className="page-subtitle">Administra el personal médico y sus horarios</p>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="search-box" style={{ position: 'relative' }}>
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Buscar por nombre o CMP..."
                            style={{
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                                width: 320,
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button className="btn-create" onClick={() => handleOpenForm(null)}>
                        <Plus size={18} /> Nuevo Médico
                    </button>
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="table-container fade-in">
                {loading ? (
                    <div className="loading-state">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Cargando datos...</p>
                    </div>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Médico</th>
                                <th>Especialidad</th>
                                <th>CMP / RNE</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicos.length > 0 ? filteredMedicos.map((medico) => (
                                <tr key={medico.id}>
                                    <td className="font-bold">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar-circle">
                                                <Stethoscope size={20} />
                                            </div>
                                            <div>
                                                <div>{medico.nombres} {medico.apellidos}</div>
                                                <div className="text-muted" style={{ fontSize: '0.8em' }}>{medico.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-tag">
                                            {medico.especialidad?.nombre || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>CMP: {medico.cmp}</div>
                                        {medico.rne && <div className="text-muted" style={{ fontSize: '0.8em' }}>RNE: {medico.rne}</div>}
                                    </td>
                                    <td>{medico.telefono || '-'}</td>
                                    {/* AHORA (CORRECTO): usa medico.status (booleano) */}
                                    <td>
                                        <span className={`status-badge ${medico.status ? 'true' : 'false'}`}>
                                            {medico.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-icon edit" onClick={() => handleOpenHorario(medico)} title="Gestionar Horarios" style={{ color: '#6366f1' }}>
                                                <Calendar size={18} />
                                            </button>
                                            <button className="btn-icon edit" onClick={() => handleOpenForm(medico)} title="Editar">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className={`btn-icon ${medico.status ? 'delete' : 'edit'}`}
                                                onClick={() => handleToggleStatus(medico)}
                                                title={medico.status ? "Desactivar" : "Activar"}
                                                style={{ color: medico.status ? '#ef4444' : '#22c55e' }}
                                            >
                                                {/* CORREGIDO: Usamos medico.status */}
                                                {medico.status ? <Ban size={18} /> : <CheckCircle size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>
                                        <div className="text-muted">No se encontraron médicos.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modales Inyectados */}
            {showFormModal && (
                <MedicoForm
                    medico={selectedMedico}
                    onClose={() => handleCloseModals(true)}
                />
            )}

            {showHorarioModal && (
                <HorarioManager
                    medico={selectedMedico}
                    onClose={() => handleCloseModals(false)}
                />
            )}
        </div>
    );
};

export default Medicos;