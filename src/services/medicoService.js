import axios from '../api/axios';

const medicoService = {
    // GET Listar médicos
    async getMedicos(page = 1, search = '', perPage = 15) {
        // Axios maneja los query params automáticamente
        return await axios.get('/medicos', {
            params: {
                page,
                per_page: perPage,
                search: search || undefined // Si es vacío, no lo manda
            }
        });
    },

    // GET Obtener médico por ID
    async getMedico(id) {
        return await axios.get(`/medicos/${id}`);
    },

    // POST Crear médico
    async createMedico(medicoData) {
        return await axios.post('/medicos', medicoData);
    },

    // PUT Actualizar médico
    async updateMedico(id, medicoData) {
        return await axios.put(`/medicos/${id}`, medicoData);
    },

    // PATCH Cambiar estado (Toggle Status)
    async toggleStatus(id, status) {
        return await axios.patch(`/medicos/${id}/toggle-status`, { status });
    }
};

export default medicoService;