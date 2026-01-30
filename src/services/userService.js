import axios from '../api/axios';

const userService = {
    // GET Listar usuarios
    async getUsers(page = 1, search = '', perPage = 15) {
        return await axios.get('/users', {
            params: {
                page,
                per_page: perPage,
                search: search || undefined
            }
        });
    },

    // GET Obtener usuario por ID
    async getUser(id) {
        return await axios.get(`/users/${id}`);
    },

    // POST Crear usuario
    async createUser(userData) {
        return await axios.post('/users', userData);
    },

    // PUT Actualizar usuario
    async updateUser(userData) {
        // Asumiendo que userData tiene el ID dentro
        return await axios.put(`/users/${userData.id}`, userData);
    },

    // DELETE Eliminar usuario
    async deleteUser(id) {
        return await axios.delete(`/users/${id}`);
    },

    // POST Cambiar estado (Toggle Status)
    async changeStatus(id) {
        return await axios.post(`/users/${id}/toggle-status`);
    },

    // POST Cambiar contraseña
    async changePassword(id, newPassword) {
        return await axios.post(`/users/${id}/change-password`, { 
            new_password: newPassword 
        });
    },

    // GET Estadísticas
    async getStats() {
        return await axios.get('/users/stats/general');
    }
};

export default userService;