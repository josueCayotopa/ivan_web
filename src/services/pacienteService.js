// src/services/pacienteService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const pacienteService = {
  // POST /api/v1/pacientes - Listar pacientes
  async getPacientes(page = 1, search = '') {
    try {
      const response = await fetch(`${API_URL}/pacientes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ page, search })
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        data: data.data || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/por-documento - Buscar por DNI
  async searchByDocument(documento) {
    try {
      console.log('Buscando paciente con DNI:', documento); // DEBUG

      const response = await fetch(`${API_URL}/pacientes/por-documento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ documento_identidad: documento })
      });

      const data = await response.json();
      
      console.log('Response búsqueda paciente:', data); // DEBUG
      
      return {
        success: data.status === 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error buscando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/show - Ver un paciente
  async getPaciente(id) {
    try {
      const response = await fetch(`${API_URL}/pacientes/show`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/store - Crear paciente
  async createPaciente(pacienteData) {
    try {
      const response = await fetch(`${API_URL}/pacientes/store`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pacienteData)
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/update - Actualizar paciente
  async updatePaciente(pacienteData) {
    try {
      const response = await fetch(`${API_URL}/pacientes/update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pacienteData)
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        message: data.message
      };
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/destroy - Eliminar paciente
  async deletePaciente(id) {
    try {
      const response = await fetch(`${API_URL}/pacientes/destroy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        message: data.message
      };
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/search - Buscar pacientes
  async searchPacientes(searchTerm) {
    try {
      const response = await fetch(`${API_URL}/pacientes/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ search: searchTerm })
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/historial - Historial de un paciente
  async getHistorial(pacienteId) {
    try {
      const response = await fetch(`${API_URL}/pacientes/historial`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paciente_id: pacienteId })
      });

      const data = await response.json();
      
      return {
        success: data.status === 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }
};

export default pacienteService;