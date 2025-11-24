import apiClient from './api.config';
import {
  ChatbotMessage,
  CreateChatbotMessageRequest,
  UpdateChatbotMessageRequest,
  ApiResponse,
} from '@/types/chatbot.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

/**
 * Servicio para gestión de mensajes del chatbot
 */
export const chatbotMessagesService = {
  /**
   * Obtener mensajes de una sesión
   * @param sessionId - ID de la sesión
   * @param limit - Límite de mensajes
   * @returns Lista de mensajes
   */
  getMessagesBySessionId: async (sessionId: number, limit?: number): Promise<ChatbotMessage[]> => {
    try {
      const params: Record<string, number> = {};
      if (limit !== undefined) params.limit = limit;

      const response = await apiClient.get<ApiResponse<ChatbotMessage[]>>(
        `/chatbot-messages/session/${sessionId}`,
        { params }
      );

      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener mensajes');
    }
  },

  /**
   * Obtener mensaje por ID
   * @param id - ID del mensaje
   * @returns Datos del mensaje
   */
  getMessageById: async (id: number): Promise<ChatbotMessage> => {
    try {
      const response = await apiClient.get<ApiResponse<ChatbotMessage>>(
        `/chatbot-messages/${id}`
      );

      if (response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Mensaje no encontrado');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al obtener mensaje');
    }
  },

  /**
   * Crear nuevo mensaje
   * @param messageData - Datos del mensaje
   * @returns Mensaje creado
   */
  createChatbotMessage: async (
    messageData: CreateChatbotMessageRequest
  ): Promise<ChatbotMessage> => {
    try {
      const response = await apiClient.post<ApiResponse<ChatbotMessage>>(
        '/chatbot-messages/',
        messageData
      );

      if (response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al crear mensaje');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al crear mensaje');
    }
  },

  /**
   * Actualizar mensaje
   * @param id - ID del mensaje
   * @param messageData - Nuevos datos
   * @returns Mensaje actualizado
   */
  updateChatbotMessage: async (
    id: number,
    messageData: UpdateChatbotMessageRequest
  ): Promise<ChatbotMessage | null> => {
    try {
      const response = await apiClient.put<ApiResponse<ChatbotMessage | null>>(
        `/chatbot-messages/${id}`,
        messageData
      );

      return response.data.data || null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al actualizar mensaje');
    }
  },

  /**
   * Editar mensaje y regenerar respuesta
   * @param id - ID del mensaje a editar
   * @param newMessage - Nuevo contenido del mensaje
   * @returns Mensaje actualizado y respuesta regenerada del bot
   */
  editMessageAndRegenerate: async (
    id: number,
    newMessage: string
  ): Promise<{ message: string; botResponse: string }> => {
    try {
      const response = await apiClient.put<
        ApiResponse<{ message: string; botResponse: string }>
      >(
        `/chatbot-messages/${id}/regenerate`,
        { message: newMessage }
      );

      if (response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al regenerar respuesta');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al editar mensaje y regenerar respuesta');
    }
  },

  /**
   * Eliminar mensaje
   * @param id - ID del mensaje a eliminar
   * @returns true si se eliminó exitosamente
   */
  deleteChatbotMessage: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete<ApiResponse<never>>(`/chatbot-messages/${id}`);
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Error al eliminar mensaje');
    }
  },
};

export default chatbotMessagesService;
