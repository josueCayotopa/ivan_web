// src/services/archivoService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        // NO poner Content-Type aquí para que el navegador configure el multipart/form-data automáticamente con el boundary correcto
        'Accept': 'application/json',
    };
};

const archivoService = {
    // Listar archivos de una entidad (ej: Paciente o Consulta)
    async getArchivos(tipoEntidad, idEntidad) {
        try {
            const response = await fetch(`${API_URL}/archivos?tipo=${tipoEntidad}&id=${idEntidad}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            });
            const data = await response.json();
            return { success: response.ok, data: data.data || [] };
        } catch (error) {
            console.error('Error al obtener archivos:', error);
            return { success: false, data: [] };
        }
    },

    // Subir nuevo archivo
    async subirArchivo(payload) {
        try {
            const formData = new FormData();
            formData.append('adjuntable_type', payload.adjuntable_type); // ej: 'App\Models\Pacientes'
            formData.append('adjuntable_id', payload.adjuntable_id);
            formData.append('categoria', payload.categoria || 'general');
            formData.append('file', payload.file); // El objeto File real

            const response = await fetch(`${API_URL}/archivos/upload`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            
            const data = await response.json();
            return { success: response.ok, data: data.data, message: data.message };
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            return { success: false, message: 'Error de conexión al subir' };
        }
    },

    // Eliminar archivo
    async eliminarArchivo(id) {
        try {
            const response = await fetch(`${API_URL}/archivos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            });
            return { success: response.ok };
        } catch (error) {
            return { success: false };
        }
    }
};

export default archivoService;