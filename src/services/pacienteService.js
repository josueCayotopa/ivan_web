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
  // POST /api/v1/pacientes - Listar pacientes (Paginado)
  async getPacientes(page = 1, search = '') {
    try {
      const response = await fetch(`${API_URL}/pacientes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ page, search })
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        data: data.data?.data || [], // Ajuste para paginación de Laravel
        total: data.data?.total || 0
      };
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/por-documento - Buscar por DNI (Para el Formulario)
  async searchByDocument(documento) {
    try {
      const response = await fetch(`${API_URL}/pacientes/por-documento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ documento: documento }) // Clave correcta según tu Controller
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        data: data.data
      };
    } catch (error) {
      console.error('Error buscando paciente por documento:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/store - Crear nuevo paciente
  async createPaciente(pacienteData) {
    try {
      const response = await fetch(`${API_URL}/pacientes/store`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pacienteData)
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        message: data.message,
        data: data.data,
        errors: data.errors
      };
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/update - Actualizar paciente existente
  async updatePaciente(pacienteData) {
    try {
      const response = await fetch(`${API_URL}/pacientes/update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pacienteData)
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      throw error;
    }
  },
 

  // POST /api/v1/pacientes/destroy - Eliminar (Soft Delete)
  async deletePaciente(id) {
    try {
      const response = await fetch(`${API_URL}/pacientes/destroy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        message: data.message
      };
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/search - Búsqueda general (Autocomplete)
  async searchPacientes(searchTerm) {
    try {
      const response = await fetch(`${API_URL}/pacientes/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ q: searchTerm }) // 'q' es lo que espera tu controller
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error buscando pacientes:', error);
      throw error;
    }
  },

  // POST /api/v1/pacientes/historial - Obtener historial clínico
  async getHistorial(id) {
    try {
      const response = await fetch(`${API_URL}/pacientes/historial`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: id }) // Controller espera 'id'
      });

      const data = await response.json();

      return {
        success: data.success || response.ok,
        data: data.data || {}
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  },
  // ✅ Agrega/Actualiza esto:
    async getStats() {
        try {
            // En tu api.php es POST
            const response = await axios.post('/pacientes/stats');
            return response.data;
        } catch (error) {
            console.error('Error stats pacientes:', error);
            return { success: false, data: { total: 0, nuevos_mes: 0 } };
        }
    },

};

export default pacienteService;