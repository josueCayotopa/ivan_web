import axios from '../api/axios';

const archivoService = {
    /**
     * Obtener archivos de una entidad específica.
     * Ruta Backend: GET /api/v1/archivos
     * @param {string} tipo - Ej: "ConsultaExterna", "Paciente"
     * @param {number} id - ID de la entidad (ej: id de la consulta)
     */
    async getArchivos(tipo, id) {
        // Axios serializa automáticamente los params en la URL
        return await axios.get('/archivos', {
            params: {
                adjuntable_type: tipo,
                adjuntable_id: id
            }
        });
    },

    /**
     * Obtener TODA la galería histórica de un paciente.
     * Ruta Backend: GET /api/v1/pacientes/{id}/galeria
     * (Definida al final de tu grupo 'v1' en api.php)
     */
    async getGaleriaPaciente(pacienteId) {
        return await axios.get(`/pacientes/${pacienteId}/galeria`);
    },

    /**
     * Subir un nuevo archivo.
     * Ruta Backend: POST /api/v1/archivos/upload
     */
    async subirArchivo(data) {
        const formData = new FormData();
        
        // Campos requeridos por tu StoreArchivoAdjuntoRequest y Service
        formData.append('file', data.file); // El objeto File nativo
        formData.append('categoria', data.categoria); // Ej: "Foto Antes"
        formData.append('adjuntable_type', data.adjuntable_type); // Ej: "ConsultaExterna"
        formData.append('adjuntable_id', data.adjuntable_id); // ID de la consulta
        
        // Campos opcionales
        if (data.descripcion) {
            formData.append('descripcion', data.descripcion);
        }
        
        // Opcional: Si quieres guardar la fecha real de captura
        if (data.fecha_captura) {
            formData.append('fecha_captura', data.fecha_captura);
        }

        // Opcional: Si el backend usa paciente_id para búsquedas rápidas (aunque tu lógica actual usa relaciones)
        if (data.paciente_id) {
            formData.append('paciente_id', data.paciente_id);
        }

        // NOTA: No necesitas agregar el Header de Authorization aquí manualmente,
        // tu instancia 'api/axios' ya debería inyectarlo. 
        // Solo especificamos el Content-Type para la subida de archivos.
        return await axios.post('/archivos/upload', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data' 
            }
        });
    },

    /**
     * Eliminar un archivo.
     * Ruta Backend: DELETE /api/v1/archivos/{id}
     */
    async eliminarArchivo(id) {
        return await axios.delete(`/archivos/${id}`);
    }
};

export default archivoService;