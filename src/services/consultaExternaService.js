const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const consultaExternaService = {

    // GET /api/v1/consultas-externas - Listar consultas (Paginado para la bandeja)
    async getAll(page = 1, filters = {}) {
        try {
            const queryParams = new URLSearchParams({ page, ...filters }).toString();
            const response = await fetch(`${API_URL}/consultas-externas?${queryParams}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();

            return {
                success: response.ok,
                data: data.data || [],
                meta: data.meta || {} // Paginación de Laravel
            };
        } catch (error) {
            console.error('Error obteniendo consultas:', error);
            throw error;
        }
    },

    // GET /api/v1/consultas-externas/atencion/{atencionId} 
    // Busca si ya existe una historia para una cita específica
    async getByAtencionId(atencionId) {
        try {
            const response = await fetch(`${API_URL}/consultas-externas/atencion/${atencionId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();

            // Retornamos tal cual para que el componente decida si es 404 (nueva) o 200 (edición)
            return {
                success: data.success || response.ok,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            // Si es un 404 real de red, devolvemos success: false para que el front sepa que es nueva
            return { success: false, message: 'Consulta no encontrada' };
        }
    },

    // POST /api/v1/consultas-externas - Crear nueva historia
    async create(payload) {
        try {
            const response = await fetch(`${API_URL}/consultas-externas`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return {
                success: data.success || response.ok,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            console.error('Error creando consulta:', error);
            throw error;
        }
    },

    // PUT /api/v1/consultas-externas/{id} - Actualizar historia existente
    async update(id, payload) {
        try {
            const response = await fetch(`${API_URL}/consultas-externas/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return {
                success: data.success || response.ok,
                data: data.data,
                message: data.message
            };
        } catch (error) {
            console.error('Error actualizando consulta:', error);
            throw error;
        }
    },

    // DELETE /api/v1/consultas-externas/{id} - Eliminar (Solo borradores)
    async delete(id) {
        try {
            const response = await fetch(`${API_URL}/consultas-externas/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return {
                success: data.success || response.ok,
                message: data.message
            };
        } catch (error) {
            console.error('Error eliminando consulta:', error);
            throw error;
        }
    },

    // GET /api/v1/consultas-externas/paciente/{id}/historial
    // Para ver el historial completo de un paciente (Línea de tiempo)
    async getHistorialPaciente(pacienteId) {
        try {
            const response = await fetch(`${API_URL}/consultas-externas/paciente/${pacienteId}/historial`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            return {
                success: response.ok,
                data: data.data || [] // Debe devolver el array de consultas pasadas
            };
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    },

    // 💡 FUNCIÓN INTELIGENTE: SAVE
    // Decide automáticamente si debe crear o actualizar
    async save(payload, consultaId = null) {
        try {
            // Si nos pasan un ID de consulta (no de atención), actualizamos
            if (consultaId) {
                return await this.update(consultaId, payload);
            }
            // Si no hay ID, es nueva
            else {
                return await this.create(payload);
            }
        } catch (error) {
            console.error('Error guardando consulta:', error);
            throw error;
        }
    }
};

export default consultaExternaService;