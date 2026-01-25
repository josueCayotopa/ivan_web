// src/services/atencionService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const atencionService = {
  // POST /api/v1/atenciones - Listar atenciones
  async getAtenciones(page = 1, filters = {}) {
    try {
      const payload = {
        page,
        ...filters
      };

      const response = await fetch(`${API_URL}/atenciones`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const jsonResponse = await response.json();

      // === LÓGICA DE EXTRACCIÓN ROBUSTA ===
      // 1. Identificamos el objeto paginador (puede venir directo o dentro de .data)
      const paginator = jsonResponse.data || jsonResponse;

      // 2. Extraemos el array de atenciones real
      // Si paginator tiene una propiedad .data que es array, usamos eso (Paginación Laravel)
      // Si no, asumimos que paginator mismo es el array (Sin paginación)
      const items = Array.isArray(paginator.data) ? paginator.data : (Array.isArray(paginator) ? paginator : []);

      // 3. Extraemos el total
      const total = paginator.total || items.length || 0;

      return {
        success: response.ok, // Usamos el status HTTP real (200-299)
        data: items,          // ¡AQUÍ ESTÁ EL ARREGLO LIMPIO!
        total: total
      };

    } catch (error) {
      console.error('Error fetching atenciones:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/agenda - Obtener agenda del día
  async getAgenda(fecha) {
    try {
      const response = await fetch(`${API_URL}/atenciones/agenda`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fecha })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching agenda:', error);
      throw error;
    }
  },
  async getAtencionesPorFecha(fecha) {
    try {
      const response = await fetch(`${API_URL}/atenciones/por-fecha`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fecha: fecha }) // Enviamos la fecha seleccionada
      });

      const jsonResponse = await response.json();

      return {
        success: response.ok,
        // Tu controlador devuelve: { success: true, count: X, data: [...] }
        data: jsonResponse.data || [],
        count: jsonResponse.count || 0
      };
    } catch (error) {
      console.error('Error fetching atenciones por fecha:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/hoy - Atenciones de hoy
  async getAtencionesHoy() {
    try {
      const response = await fetch(`${API_URL}/atenciones/hoy`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching atenciones hoy:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/show - Ver una atención
  async getAtencion(id) {
    try {
      const response = await fetch(`${API_URL}/atenciones/show`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching atencion:', error);
      throw error;
    }
  },
  // POST /api/v1/atenciones/store - Crear atención
  async createAtencion(atencionData) {
    try {
      const response = await fetch(`${API_URL}/atenciones/store`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(atencionData)
      });

      const data = await response.json();

      return {
        // ✅ CORRECCIÓN: Aceptamos cualquier código 2xx (200, 201) o la bandera success
        success: data.success || response.ok,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error creating atencion:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/update - Actualizar atención
  async updateAtencion(id, atencionData) {
    try {
      const response = await fetch(`${API_URL}/atenciones/update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...atencionData })
      });

      const data = await response.json();

      return {
        // ✅ CORRECCIÓN
        success: data.success || response.ok,
        message: data.message,
        data: data.data
      };
    } catch (error) {
      console.error('Error updating atencion:', error);
      throw error;
    }
  },
  // POST /api/v1/atenciones/cambiar-estado - Cambiar estado
  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await fetch(`${API_URL}/atenciones/cambiar-estado`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id,
          estado: nuevoEstado
        })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        message: data.message
      };
    } catch (error) {
      console.error('Error changing estado:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/registrar-salida - Registrar salida
  async registrarSalida(id, datosTriaje = {}) {
    try {
      const response = await fetch(`${API_URL}/atenciones/registrar-salida`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id,
          ...datosTriaje
        })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        message: data.message
      };
    } catch (error) {
      console.error('Error registering salida:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/destroy - Eliminar atención
  async deleteAtencion(id) {
    try {
      const response = await fetch(`${API_URL}/atenciones/destroy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        message: data.message
      };
    } catch (error) {
      console.error('Error deleting atencion:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/por-paciente - Atenciones de un paciente
  async getAtencionesPorPaciente(pacienteId) {
    try {
      const response = await fetch(`${API_URL}/atenciones/por-paciente`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paciente_id: pacienteId })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching atenciones paciente:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/por-medico - Atenciones de un médico
  async getAtencionesPorMedico(medicoId, fecha = null) {
    try {
      const response = await fetch(`${API_URL}/atenciones/por-medico`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          medico_id: medicoId,
          ...(fecha && { fecha })
        })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching atenciones medico:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/stats - Estadísticas
  async getEstadisticas(filters = {}) {
    try {
      const response = await fetch(`${API_URL}/atenciones/stats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(filters)
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // POST /api/v1/atenciones/search - Buscar atenciones
  async searchAtenciones(searchTerm) {
    try {
      const response = await fetch(`${API_URL}/atenciones/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ search: searchTerm })
      });

      const data = await response.json();

      return {
        status: data.status,
        success: data.status === 200,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error searching atenciones:', error);
      throw error;
    }
  }
};

export default atencionService;