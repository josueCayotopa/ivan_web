import axios from '../api/axios';

const roleService = {
    // GET Listar todos los roles
    async getRoles() {
        return await axios.get('/roles');
    },

    // GET Roles activos
    async getActiveRoles() {
        return await axios.get('/roles/activos');
    },

    // GET Obtener rol por ID
    async getRole(id) {
        return await axios.get(`/roles/${id}`);
    },

    // POST Crear rol
    async createRole(roleData) {
        return await axios.post('/roles', roleData);
    },

    // PUT Actualizar rol
    async updateRole(id, roleData) {
        return await axios.put(`/roles/${id}`, roleData);
    },

    // DELETE Eliminar rol
    async deleteRole(id) {
        return await axios.delete(`/roles/${id}`);
    },

    // PATCH Cambiar estado
    async toggleStatus(id) {
        return await axios.patch(`/roles/${id}/toggle-status`);
    },

    // GET Usuarios por rol
    async getUsersByRole(id) {
        return await axios.get(`/roles/${id}/users`);
    },

    // GET Estadísticas
    async getStats() {
        return await axios.get('/roles/stats/general');
    }
};

export default roleService;