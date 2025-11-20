import apiClient from './api.config';
import {
  ChatbotSession,
  CreateChatbotSessionRequest,
  UpdateChatbotSessionRequest,
  ApiResponse,
} from '@/types/chatbot.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

/**
 * Servicio para gestión de sesiones de chatbot
 */
export const chatbotService = {
  /**
   * Obtener todas las sesiones de chatbot con paginación
   * @param limit - Límite de resultados
   * @param offset - Desplazamiento para paginación
   * @returns Lista de sesiones
   */
  getAllSessions: async (limit?: number, offset?: number): Promise<ChatbotSession[]> => {
    try {
      const params: Record<string, number> = {};
      if (limit !== undefined) params.limit = limit;
      if (offset !== undefined) params.offset = offset;

      const response = await apiClient.get<ApiResponse<ChatbotSession[]>>(
        '/chatbot-sessions/',
        { params }
      );
      
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener sesiones de chatbot');
    }
  },

  /**
   * Obtener una sesión por ID
   * @param id - ID de la sesión
   * @returns Datos de la sesión
   */
  getSessionById: async (id: number): Promise<ChatbotSession> => {
    try {
      const response = await apiClient.get<ApiResponse<ChatbotSession>>(
        `/chatbot-sessions/${id}`
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Sesión no encontrada');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener sesión');
    }
  },

  /**
   * Obtener todas las sesiones de un usuario
   * @param userId - ID del usuario
   * @returns Lista de sesiones del usuario
   */
  getSessionsByUserId: async (userId: number): Promise<ChatbotSession[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ChatbotSession[]>>(
        `/chatbot-sessions/user/${userId}`
      );
      
      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener sesiones del usuario');
    }
  },

  /**
   * Obtener sesión activa de un usuario
   * @param userId - ID del usuario
   * @returns Sesión activa o null
   */
  getActiveSession: async (userId: number): Promise<ChatbotSession[] | null> => {
    try {
      const response = await apiClient.get<ApiResponse<ChatbotSession[] | null>>(
        `/chatbot-sessions/active/${userId}`
      );
      
      return response.data.data || null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener sesión activa');
    }
  },

  /**
   * Crear una nueva sesión de chatbot
   * @param sessionData - Datos de la sesión a crear
   * @returns Sesión creada
   */
  createSession: async (sessionData: CreateChatbotSessionRequest): Promise<ChatbotSession> => {
    try {
      const response = await apiClient.post<ApiResponse<ChatbotSession>>(
        '/chatbot-sessions/',
        sessionData
      );
      
      if (response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Error al crear sesión');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al crear sesión de chatbot');
    }
  },

  /**
   * Actualizar una sesión existente
   * @param id - ID de la sesión
   * @param sessionData - Datos a actualizar
   * @returns Sesión actualizada
   */
  updateSession: async (
    id: number,
    sessionData: UpdateChatbotSessionRequest
  ): Promise<ChatbotSession | null> => {
    try {
      const response = await apiClient.put<ApiResponse<ChatbotSession | null>>(
        `/chatbot-sessions/${id}`,
        sessionData
      );
      
      return response.data.data || null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al actualizar sesión');
    }
  },

  /**
   * Eliminar una sesión
   * @param id - ID de la sesión a eliminar
   * @returns true si se eliminó exitosamente
   */
  deleteSession: async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.delete<ApiResponse<boolean>>(
        `/chatbot-sessions/${id}`
      );
      return response.data.data || false;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al eliminar sesión');
    }
  },
};

export default chatbotService;
