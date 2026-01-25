import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import roleService from "../../services/roleService";
import './Roles.css';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await roleService.getRoles();
            // Adjust based on actual API response structure (e.g., response.data versus just response)
            // Assuming response is the array or { data: [...] }
            if (Array.isArray(response)) {
                setRoles(response);
            } else if (response.data && Array.isArray(response.data)) {
                setRoles(response.data);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const { value: name } = await Swal.fire({
            title: 'Nuevo Rol',
            input: 'text',
            inputLabel: 'Nombre del Rol',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'El nombre es obligatorio';
                }
            }
        });

        if (name) {
            try {
                await roleService.createRole({ name }); // Adjust payload as needed by backend
                Swal.fire('Éxito', 'Rol creado correctamente', 'success');
                fetchRoles();
            } catch (error) {
                Swal.fire('Error', 'No se pudo crear el rol', 'error');
            }
        }
    };

    return (
        <div className="roles-container">
            <div className="page-header">
                <h2 className="page-title">Gestión de Roles</h2>
                <button className="btn-create" onClick={handleCreate}>
                    + Nuevo Rol
                </button>
            </div>

            <div className="table-container fade-in">
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>Cargando roles...</div>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre del Rol</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.length > 0 ? roles.map((role) => (
                                <tr key={role.id}>
                                    <td>{role.id}</td>
                                    <td className="font-bold">{role.name}</td>
                                    <td>{role.description || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${role.status === 1 ? 'active' : 'inactive'}`}>
                                            {role.status === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-icon edit" title="Editar">✏️</button>
                                            <button className="btn-icon delete" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">No hay roles registrados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Roles;