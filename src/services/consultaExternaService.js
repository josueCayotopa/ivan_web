import axios from '../api/axios';

const consultaExternaService = {

    // ==================== CRUD BÁSICO ====================

    async getAll(page = 1, filters = {}) {
        try {
            const response = await axios.get('/consultas-externas', {
                params: { page, per_page: 15, ...filters }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Error al listar consultas:', error);
            return { success: false, message: 'Error al cargar consultas' };
        }
    },

    async getById(id) {
        try {
            const response = await axios.get(`/consultas-externas/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error al obtener consulta ${id}:`, error);
            return { success: false, message: 'Consulta no encontrada' };
        }
    },

    // ✅ CORRECCIÓN AQUÍ: Devolvemos 'response' directo para no perder el 'success: true'
    async getByAtencionId(atencionId) {
        try {
            console.log(`🔍 Buscando historia para atención ID: ${atencionId}`);

            // Axios ya devuelve el cuerpo JSON, así que 'response' es { success: true, data: ... }
            const response = await axios.get(`/consultas-externas/atencion/${atencionId}`);

            console.log('📥 Respuesta API getByAtencionId:', response);

            // ⚠️ ANTES: return response.data; (Esto borraba el 'success')
            // ✅ AHORA:
            return response;

        } catch (error) {
            // Si es 404, significa que no existe historia (caso válido para crear nueva)
            if (error.response?.status === 404) {
                console.log('ℹ️ No existe historia previa (Modo Creación)');
                return { success: false, message: 'No encontrada', data: null };
            }
            console.error('❌ Error al buscar por atención:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    async create(payload) {
        try {
            const response = await axios.post('/consultas-externas', payload);
            // En creación a veces conviene devolver todo para verificar success
            return response.data || response;
        } catch (error) {
            console.error('❌ Error al crear consulta:', error);
            return { success: false, message: error.response?.data?.message || 'Error al crear' };
        }
    },

    async update(id, payload) {
        try {
            const response = await axios.put(`/consultas-externas/${id}`, payload);
            return response.data || response;
        } catch (error) {
            console.error(`❌ Error al actualizar consulta ${id}:`, error);
            return { success: false, message: error.response?.data?.message || 'Error al actualizar' };
        }
    },

    async delete(id) {
        try {
            const response = await axios.delete(`/consultas-externas/${id}`);
            return response.data;
        } catch (error) {
            return { success: false, message: 'Error al eliminar consulta' };
        }
    },

    // ==================== FUNCIONES INTELIGENTES ====================

    async save(payload, consultaId = null) {
        try {
            if (consultaId) {
                return await this.update(consultaId, payload);
            } else {
                return await this.create(payload);
            }
        } catch (error) {
            console.error('❌ Error en save:', error);
            return { success: false, message: 'Error al guardar' };
        }
    },

    // ==================== OTRAS FUNCIONES (Se mantienen igual) ====================
    async completar(id) {
        try { const r = await axios.post(`/consultas-externas/${id}/completar`); return r.data; } catch (e) { return { success: false }; }
    },
    async guardarBorrador(id) {
        try { const r = await axios.post(`/consultas-externas/${id}/borrador`); return r.data; } catch (e) { return { success: false }; }
    },
    async firmarConsentimiento(id, archivoId = null) {
        try { const r = await axios.post(`/consultas-externas/${id}/firmar-consentimiento`, { archivo_id: archivoId }); return r.data; } catch (e) { return { success: false }; }
    },
    async calcularIMC(id) {
        try { const r = await axios.post(`/consultas-externas/${id}/calcular-imc`); return r.data; } catch (e) { return { success: false }; }
    },

    // ==================== UTILIDADES ====================
    calcularIMCLocal(peso, talla) {
        if (!peso || !talla || talla === 0) return null;
        const imc = peso / (talla * talla);
        return parseFloat(imc.toFixed(2));
    },
    formatearPresion(sistolica, diastolica) {
        if (!sistolica || !diastolica) return '';
        return `${sistolica}/${diastolica}`;
    },
    parsearPresion(presion) {
        if (!presion || !presion.includes('/')) return { sistolica: '', diastolica: '' };
        const [sistolica, diastolica] = presion.split('/');
        return { sistolica, diastolica };
    },
    estaListaParaCirugia(consulta) {
        return Boolean(consulta.consentimiento_informado && consulta.ficha_completada && consulta.presion_arterial && consulta.peso);
    }
};

export default consultaExternaService;