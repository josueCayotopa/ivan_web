import axios from '../api/axios';

const horarioService = {
  // POST Crear horario fecha específica
  async crearHorarioFecha(data) {
    const payload = {
      medico_id: data.medico_id,
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      duracion_cita: parseInt(data.duracion_cita),
      consultorio: data.consultorio || null
    };
    return await axios.post('/utils/crear-horario-fecha', payload);
  },

  // POST Crear horario recurrente
  async crearHorarioRecurrente(data) {
    const payload = {
      medico_id: data.medico_id,
      dia_semana: parseInt(data.dia_semana),
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      duracion_cita: parseInt(data.duracion_cita),
      consultorio: data.consultorio || null
    };
    return await axios.post('/utils/crear-horario-recurrente', payload);
  },

  // POST Obtener horarios de médico
  async getHorariosMedico(medicoId) {
    return await axios.post('/utils/horarios-medico', { medico_id: medicoId });
  }
};

export default horarioService;