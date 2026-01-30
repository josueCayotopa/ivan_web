import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        // ❌ ELIMINADO: 'Content-Type': 'application/json' 
        // ¿Por qué? Axios detecta automáticamente si envías un objeto (JSON) o un FormData (Archivo)
        // y pone el header correcto. Si lo forzamos aquí, la subida de fotos fallará.
    },
});

// --- INTERCEPTOR REQUEST (Salida) ---
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR RESPONSE (Entrada) ---
axiosInstance.interceptors.response.use(
    (response) => {
        // ✅ ÉXITO: Normalizamos la respuesta
        // Devolvemos directamente lo que tus servicios esperan recibir
        return {
            success: true,
            data: response.data.data || response.data, // Soporte para paginación Laravel
            message: response.data.message || 'Operación exitosa',
            status: response.status,
            ...response.data // Incluimos meta, links, etc.
        };
    },
    (error) => {
        // ❌ ERROR: Manejo centralizado
        let message = 'Error de conexión con el servidor';
        
        if (error.response) {
            // El servidor respondió con un código de error (4xx, 5xx)
            
            // 1. Token Vencido (401)
            if (error.response.status === 401) {
                console.warn("Sesión expirada. Cerrando sesión...");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return { success: false, message: 'Sesión expirada' }; 
            }

            // 2. Sin Permisos (403)
            if (error.response.status === 403) {
                message = 'No tienes permisos para realizar esta acción.';
            }

            // 3. Errores de Validación (422) - Típico de Laravel
            if (error.response.status === 422) {
                // Unimos los errores en un solo texto o devolvemos el primero
                const errors = error.response.data.errors;
                message = errors ? Object.values(errors).flat().join(', ') : error.response.data.message;
            } else {
                // Otros errores (500, 404, etc)
                message = error.response.data.message || message;
            }
        }

        console.error('API Error:', message);

        // 🔥 TRUCO IMPORTANTE:
        // En lugar de hacer "Promise.reject(error)" que obliga a usar try-catch en todos lados,
        // resolvemos con success: false. Así tus servicios siguen el flujo normal.
        return Promise.resolve({
            success: false,
            message: message,
            status: error.response?.status || 0,
            originalError: error
        });
    }
);


export default axiosInstance;