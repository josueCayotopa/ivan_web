// src/services/roleService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const roleService = {
  // GET /api/v1/roles - Listar todos los roles
  async getRoles() {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: 200,
        data: data.data || data || []
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // GET /api/v1/roles/activos - Roles activos
  async getActiveRoles() {
    try {
      const response = await fetch(`${API_URL}/roles/activos`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: 200,
        data: data.data || data || []
      };
    } catch (error) {
      console.error('Error fetching active roles:', error);
      throw error;
    }
  },

  // GET /api/v1/roles/{id} - Obtener rol por ID
  async getRole(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: 200,
        data: data.data || data
      };
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // POST /api/v1/roles - Crear rol
  async createRole(roleData) {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // PUT /api/v1/roles/{id} - Actualizar rol
  async updateRole(id, roleData) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // DELETE /api/v1/roles/{id} - Eliminar rol
  async deleteRole(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message
      };
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  // PATCH /api/v1/roles/{id}/toggle-status - Cambiar estado
  async toggleStatus(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error toggling status:', error);
      throw error;
    }
  },

  // GET /api/v1/roles/{id}/users - Usuarios por rol
  async getUsersByRole(id) {
    try {
      const response = await fetch(`${API_URL}/roles/${id}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // GET /api/v1/roles/stats/general - Estadísticas
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/roles/stats/general`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

export default roleService;