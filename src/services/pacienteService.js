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
      
      // Corregido: Usar success o response.ok
      return {
        success: data.success || response.ok,
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
      const response = await fetch(`${API_URL}/pacientes/por-documento`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ documento: documento }) // Ojo: Tu controller espera 'documento', no 'documento_identidad'
      });

      const data = await response.json();
      
      // ✅ CORRECCIÓN CLAVE AQUÍ:
      // Tu backend devuelve { success: true, data: {...} }
      // Antes tenías `data.status === 200`, que daba falso.
      return {
        success: data.success || response.ok,
        data: data.data
      };
    } catch (error) {
      console.error('Error buscando paciente:', error);
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
      
      // ✅ CORRECCIÓN CLAVE AQUÍ TAMBIÉN:
      return {
        success: data.success || response.ok, 
        message: data.message,
        data: data.data,
        errors: data.errors // Por si hay errores de validación
      };
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  },

  // ... (Mantén el resto de funciones como update, delete, etc. aplicando la misma lógica de success) ...
  
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
            success: data.success || response.ok,
            message: data.message
        };
    } catch (error) { throw error; }
  },

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
    } catch (error) { throw error; }
  },
  
  async searchPacientes(searchTerm) {
      try {
        const response = await fetch(`${API_URL}/pacientes/search`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ q: searchTerm }) // Tu controller usa 'q'
        });
        const data = await response.json();
        return {
          success: data.success || response.ok,
          data: data.data || []
        };
      } catch (error) { throw error; }
  }
};

export default pacienteService;