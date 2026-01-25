// src/services/medicoService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const medicoService = {
  // GET /api/v1/medicos - Listar médicos
  async getMedicos(page = 1, search = '', perPage = 15) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search })
      });

      const response = await fetch(`${API_URL}/medicos?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: response.ok ? 200 : 400,
        data: data.data || data,
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching medicos:', error);
      throw error;
    }
  },

  // GET /api/v1/medicos/{id}
  async getMedico(id) {
    try {
      const response = await fetch(`${API_URL}/medicos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 404,
        data: data.data
      };
    } catch (error) {
      throw error;
    }
  },

  // POST /api/v1/medicos
  async createMedico(medicoData) {
    try {
      const response = await fetch(`${API_URL}/medicos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicoData)
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      throw error;
    }
  },

  // PUT /api/v1/medicos/{id}
  async updateMedico(id, medicoData) {
    try {
      const response = await fetch(`${API_URL}/medicos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicoData)
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message
      };
    } catch (error) {
      throw error;
    }
  },

  // PATCH /api/v1/medicos/{id}/toggle-status
  async toggleStatus(id) {
    try {
      const response = await fetch(`${API_URL}/medicos/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        status: data.success ? 200 : 400,
        message: data.message
      };
    } catch (error) {
      throw error;
    }
  }
};

export default medicoService;