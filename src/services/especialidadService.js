import axios from '../api/axios';

const especialidadService = {
  // POST Obtener especialidades activas
  // (Tu backend usa POST para esto según api.php)
  async getEspecialidadesActivas() {
    return await axios.post('/especialidades/activas');
  },
  
  // CRUD completo si lo necesitas
  async getAll(page = 1, search = '') {
    return await axios.post('/especialidades', { page, search });
  },
  
  async create(data) {
    return await axios.post('/especialidades/store', data);
  }
};

export default especialidadService;