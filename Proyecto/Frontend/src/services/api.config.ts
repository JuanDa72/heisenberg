import axios from 'axios';

// Configuración base de la API del Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Instancia de axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores global
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
