// src/services/horarioService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const horarioService = {
  // POST: Crear horario fecha específica
  async crearHorarioFecha(data) {
    try {
      // Mapeo explícito para asegurar que enviamos lo que pide Laravel
      const payload = {
        medico_id: data.medico_id, // ¡CRUCIAL!
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        duracion_cita: parseInt(data.duracion_cita),
        consultorio: data.consultorio || null
      };

      const response = await fetch(`${API_URL}/utils/crear-horario-fecha`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return result; // Devolvemos la respuesta completa del backend
    } catch (error) {
      console.error('Error creating horario fecha:', error);
      throw error;
    }
  },

  // POST: Crear horario recurrente
  async crearHorarioRecurrente(data) {
    try {
      const payload = {
        medico_id: data.medico_id, // ¡CRUCIAL!
        dia_semana: parseInt(data.dia_semana),
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        duracion_cita: parseInt(data.duracion_cita),
        consultorio: data.consultorio || null
      };

      const response = await fetch(`${API_URL}/utils/crear-horario-recurrente`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating horario recurrente:', error);
      throw error;
    }
  },

  // POST: Obtener horarios de médico
  async getHorariosMedico(medicoId) {
    try {
      const response = await fetch(`${API_URL}/utils/horarios-medico`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ medico_id: medicoId })
      });

      const result = await response.json();
      return {
        status: result.status,
        data: result.data || []
      };
    } catch (error) {
      console.error('Error fetching horarios:', error);
      throw error;
    }
  }
};

export default horarioService;