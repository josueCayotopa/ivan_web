import React, { useState, useEffect } from 'react';
import './Users.css';
import { User, LogOut, Edit, Trash2, X, Plus, Shield, CheckCircle, Ban } from 'lucide-react';
import userService from "../../services/userService";
import roleService from "../../services/roleService";
import Swal from 'sweetalert2';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');


    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const initialFormState = {
        id: null,
        name: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        roles: [] // Array of role IDs
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        let fetchedUsers = [];

        // 1. Cargar Usuarios (Prioridad)
        try {
            // Aumentamos el límite para ver a todos (Doctors + Admins + Staff)
            const usersData = await userService.getUsers(1, '', 10);
            if (usersData.status === 200 || usersData.status === 201 && usersData.data) {
                fetchedUsers = usersData.data;
                // Mostrar datos iniciales mientras cargamos roles
                setUsers(fetchedUsers);
            }
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Error al cargar la lista de usuarios. ' + (err.response?.data?.message || err.message));
        }

        // 2. Cargar Roles (Si falla, no bloquea usuarios)
        try {
            const rolesData = await roleService.getRoles();
            if (rolesData.status === 200 && rolesData.data) {
                setRoles(rolesData.data);
            }
        } catch (err) {
            console.warn('Roles API error (ignored):', err);
            // No seteamos error global para permitir trabajar con los usuarios
        }

        // 3. HYDRATION: Ya no es necesario, el backend devuelve 'rolName'
        // if (fetchedUsers.length > 0) { ... }

        setLoading(false);
    };

    const handleOpenModal = (user = null) => {
        setError('');
        if (user) {
            setIsEditing(true);
            setFormData({
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username || '',
                phone: user.phone || '',
                password: '', // Password empty on edit
                roles: user.roles ? user.roles.map(r => r.id) : [] // Try to get IDs if populated, else empty
            });
            // If the user object from list doesn't have full roles structure, might need to fetch detail.
            // But for now let's assume roles are not fully populated in list view (often they aren't).
            // Let's fetch detail to be safe if editing
            fetchUserDetail(user.id);
        } else {
            setIsEditing(false);
            setFormData(initialFormState);
        }
        setShowModal(true);
    };

    const fetchUserDetail = async (id) => {
        try {
            const response = await userService.getUser(id);
            if (response.status === 200 || response.status === 201) {
                const u = response.data;
                const userRoles = response.roles || [];
                setFormData(prev => ({
                    ...prev,
                    roles: userRoles.map(r => parseInt(r.id))
                }));
            }
        } catch (err) {
            console.error("Error updating detail", err);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(initialFormState);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRoleToggle = (roleId) => {
        const idInt = parseInt(roleId);
        setFormData(prev => {
            const currentRoles = prev.roles.map(r => parseInt(r));
            const newRoles = currentRoles.includes(idInt)
                ? currentRoles.filter(id => id !== idInt)
                : [...currentRoles, idInt];
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');

        try {
            let response;
            if (isEditing) {
                // Update
                response = await userService.updateUser(formData);
            } else {
                // Create
                response = await userService.createUser(formData);
            }

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Usuario Actualizado' : 'Usuario Creado',
                    showConfirmButton: false,
                    timer: 1500
                });
                handleCloseModal();
                loadData(); // Refresh list
            } else {
                setError(response.message || 'Error al guardar usuario');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            const validationDetails = err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : '';
            setError(`Error: ${msg} ${validationDetails}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.status == 1 ? 'Desactivar' : 'Activar';
        const result = await Swal.fire({
            title: `¿${action} usuario?`,
            text: `El usuario ${user.name} será ${action.toLowerCase()}DO.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await userService.changeStatus(user.id);
                loadData();
                Swal.fire('Actualizado', `El estado ha sido cambiado.`, 'success');
            } catch (err) {
                Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
            }
        }
    };
    const filteredUsers = users.filter((u) => {
        const q = searchText.trim().toLowerCase();
        if (!q) return true;

        const name = (u.name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();

        return name.includes(q) || username.includes(q) || email.includes(q);
    });



    return (
        <div className="users-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Gestión de Usuarios</h2>
                    <p className="page-subtitle">Administra el acceso y roles del personal</p>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Buscar por nombre, usuario o correo..."
                        style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            width: 320,
                            outline: 'none'
                        }}
                    />
                    <button className="btn-create" onClick={() => handleOpenModal(null)}>
                        <Plus size={18} /> Nuevo Usuario
                    </button>
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="table-container fade-in">
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Cargando datos...</p>
                    </div>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Roles</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (

                                <tr key={user.id}>
                                    <td className="font-bold">{user.name}</td>
                                    <td className="text-muted">@{user.username || '-'}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>
                                        {/* Display Role Names here if available, logic might verify against roles list */}
                                        {user.rolName || (roles.find(r => r.id === user.roles?.[0]?.id)?.name) || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`status-pill ${user.status == 1 ? 'active' : 'inactive'}`}>
                                            {user.status == 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(user)} title="Editar">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className={`btn-icon ${user.status == 1 ? 'delete' : 'edit'}`}
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.status == 1 ? "Desactivar" : "Activar"}
                                                style={{ color: user.status == 1 ? '#ef4444' : '#22c55e' }}
                                            >
                                                {user.status == 1 ? <Ban size={18} /> : <CheckCircle size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>
                                        <div className="text-muted">No existen usuarios activos.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button className="btn-close" onClick={handleCloseModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Usuario (Username)</label>
                                    <input name="username" value={formData.username} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                {!isEditing && (
                                    <div className="form-group">
                                        <label>Contraseña</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                                    </div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Asignar Roles</label>
                                <div className="roles-grid">
                                    {roles.length > 0 ? roles.map(role => (
                                        <div key={role.id} className={`role-card ${formData.roles.includes(parseInt(role.id)) ? 'selected' : ''}`} onClick={() => handleRoleToggle(role.id)}>
                                            <Shield size={16} />
                                            <span>{role.name}</span>
                                            {formData.roles.includes(parseInt(role.id)) && <CheckCircle size={16} className="check-icon" />}
                                        </div>
                                    )) : <p className="text-muted">No hay roles disponibles.</p>}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className="btn-save" disabled={submitLoading}>
                                    {submitLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Users;