// src/services/especialidadService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const especialidadService = {
  async getEspecialidadesActivas() {
    try {
      // NOTA: Asegúrate de que esta ruta '/activas' exista en tu backend
      const response = await fetch(`${API_URL}/especialidades/activas`, {
        method: 'POST', // O 'GET', verifica tu api.php
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      return {
        // ✅ CORREGIDO: Usamos el estado HTTP real en lugar de buscarlo en el JSON
        status: response.ok ? 200 : 400, 
        // Laravel devuelve { data: [...] }, así que accedemos a data.data
        data: data.data || []
      };
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      throw error;
    }
  }
};

export default especialidadService;