import axios from '../api/axios';

const atencionService = {
    // POST Listar atenciones (con filtros y paginación)
    async getAtenciones(page = 1, filters = {}) {
        const payload = { page, ...filters };
        // Axios envía el objeto directamente, no necesitas JSON.stringify
        return await axios.post('/atenciones', payload);
    },

    // POST Agenda del día
    async getAgenda(fecha) {
        return await axios.post('/atenciones/agenda', { fecha });
    },

    // POST Atenciones por fecha (Eager Loading)
    async getAtencionesPorFecha(fecha) {
        return await axios.post('/atenciones/por-fecha', { fecha });
    },

    // POST Atenciones de hoy
    async getAtencionesHoy() {
        return await axios.post('/atenciones/hoy');
    },

    // POST Ver una atención específica
    async getAtencion(id) {
        return await axios.post('/atenciones/show', { id });
    },

    // POST Crear atención
    async createAtencion(atencionData) {
        return await axios.post('/atenciones/store', atencionData);
    },

    // atencionService.js
    async updateAtencion(id, atencionData) {
        // Enviamos el id dentro del cuerpo del POST como espera tu controlador
        return await axios.post('/atenciones/update', { id, ...atencionData });
    },

    // POST Cambiar estado
    async cambiarEstado(id, nuevoEstado) {
        return await axios.post('/atenciones/cambiar-estado', { id, estado: nuevoEstado });
    },

    // POST Registrar salida (Triaje de salida)
    async registrarSalida(id, datosTriaje = {}) {
        return await axios.post('/atenciones/registrar-salida', { id, ...datosTriaje });
    },

    // POST Eliminar atención
    async deleteAtencion(id) {
        return await axios.post('/atenciones/destroy', { id });
    },

    // POST Atenciones por paciente
    async getAtencionesPorPaciente(pacienteId) {
        return await axios.post('/atenciones/por-paciente', { paciente_id: pacienteId });
    },

    // POST Atenciones por médico
    async getAtencionesPorMedico(medicoId, fecha = null) {
        const payload = { medico_id: medicoId };
        if (fecha) payload.fecha = fecha;
        return await axios.post('/atenciones/por-medico', payload);
    },

    // POST Estadísticas
    async getEstadisticas(filters = {}) {
        return await axios.post('/atenciones/stats', filters);
    },

    // En atencionService.js, cambia la línea 66 por:
    async searchAtenciones(searchTerm) {
        // Cambiamos 'search' por 'q' para que coincida con AtencionController::search
        return await axios.post('/atenciones/search', { q: searchTerm });
    },

    async getStats() {
        try {
            // Ajusta según uses axios o fetch en este archivo
            const response = await axios.post('/atenciones/stats');
            return response.data;
        } catch (error) {
            return { success: false, data: { hoy: 0, pendientes: 0, atendidas: 0 } };
        }
    },
};

export default atencionService;