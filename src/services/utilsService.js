// src/services/utilsService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const utilsService = {
    // Obtener lista de especialidades activas
    async getEspecialidades() {
        try {
            const response = await fetch(`${API_URL}/utils/especialidades`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error al cargar especialidades', error);
            return [];
        }
    },

    // Obtener médicos filtrados por especialidad
    async getMedicosPorEspecialidad(especialidadId) {
        try {
            const response = await fetch(`${API_URL}/utils/medicos-por-especialidad`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    especialidad_id: especialidadId,
                    solo_activos: true
                })
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error al cargar médicos', error);
            return [];
        }
    },

    async getCitasDisponibles(medicoId, fecha) {
        try {
            const response = await fetch(`${API_URL}/utils/citas-disponibles`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    medico_id: medicoId,
                    fecha: fecha
                })
            });
            const data = await response.json();

            // ✅ CORRECCIÓN CLAVE:
            // 1. Accedemos a data.data.horarios (donde está el array)
            const listaCompleta = data.data?.horarios || [];

            // 2. Mapeamos para obtener solo la hora en texto ("08:00")
            // Tu modelo HorarioMedicos devuelve objetos { hora: "08:00", timestamp: "..." }
            return listaCompleta.map(slot => slot.hora || slot);

        } catch (error) {
            console.error('Error al cargar horarios', error);
            return [];
        }

    },

    // Generar número de atención (opcional, para pre-llenar)
    async generarNumeroAtencion() {
        try {
            const response = await fetch(`${API_URL}/utils/generar-numero-atencion`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return data.data?.numero_atencion || '';
        } catch (error) {
            return '';
        }
    }
};

export default utilsService;