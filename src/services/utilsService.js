import axios from '../api/axios';

const utilsService = {
    // Obtener lista de especialidades activas
    async getEspecialidades() {
        return await axios.post('/utils/especialidades');
    },

    // Obtener médicos filtrados por especialidad
    async getMedicosPorEspecialidad(especialidadId) {
        return await axios.post('/utils/medicos-por-especialidad', {
            especialidad_id: especialidadId,
            solo_activos: true
        });
    },

    // Obtener citas disponibles (Transformando la data para el componente)
    async getCitasDisponibles(medicoId, fecha) {
        try {
            const response = await axios.post('/utils/citas-disponibles', {
                medico_id: medicoId,
                fecha: fecha
            });

            if (response.success) {
                // El backend devuelve { data: { horarios: [...] } }
                // Extraemos el array de horarios
                const listaCompleta = response.data?.horarios || [];
                
                // Mapeamos para devolver solo las horas ["08:00", "08:30"]
                // soportando tanto objetos como strings
                const horariosSimples = listaCompleta.map(slot => slot.hora || slot);

                // Devolvemos el array dentro de .data para mantener consistencia
                return { ...response, data: horariosSimples };
            }
            return response;
        } catch (error) {
            console.error('Error procesando horarios:', error);
            return { success: false, data: [] };
        }
    },

    // Generar número de atención
    async generarNumeroAtencion() {
        const response = await axios.post('/utils/generar-numero-atencion');
        if (response.success) {
            return response.data?.numero_atencion || '';
        }
        return '';
    }
};

export default utilsService;