// src/services/userService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const userService = {
    // GET /api/v1/users - Listar usuarios
    async getUsers(page = 1, search = '', perPage = 15) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
                ...(search && { search })
            });

            const response = await fetch(`${API_URL}/users?${params}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            // Tu backend puede devolver directamente data o { data: [...] }
            return {
                status: response.ok ? 200 : data.status,
                data: data.data || data,
                total: data.total || 0,
                currentPage: data.current_page || page,
                lastPage: data.last_page || 1
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // GET /api/v1/users/{id} - Obtener usuario por ID
    async getUser(id) {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 404,
                data: data.data,
                roles: data.data?.roles || []
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // POST /api/v1/users/create - Crear usuario (público)
    async createUser(userData) {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(), // usa token porque tu grupo está protegido
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        return {
            status: response.status,     // 201 normalmente
            message: data.message,
            data: data.data,
            errors: data.errors,
            success: data.success
        };
    },


  // PUT /api/v1/users/{id} - Actualizar usuario
  async updateUser(userData) {
        try {
            const response = await fetch(`${API_URL}/users/${userData.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 400,
                message: data.message,
                data: data.data
            };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // DELETE /api/v1/users/{id} - Eliminar usuario
    async deleteUser(id) {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 400,
                message: data.message
            };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // POST /api/v1/users/{id}/toggle-status - Cambiar estado
    async changeStatus(id) {
        try {
            const response = await fetch(`${API_URL}/users/${id}/toggle-status`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 400,
                message: data.message,
                data: data.data
            };
        } catch (error) {
            console.error('Error changing status:', error);
            throw error;
        }
    },

    // POST /api/v1/users/{id}/change-password - Cambiar contraseña
    async changePassword(id, newPassword) {
        try {
            const response = await fetch(`${API_URL}/users/${id}/change-password`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ new_password: newPassword })
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 400,
                message: data.message
            };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    // GET /api/v1/users/stats/general - Estadísticas
    async getStats() {
        try {
            const response = await fetch(`${API_URL}/users/stats/general`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            return {
                status: data.success ? 200 : 400,
                data: data.data
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
};

export default userService;