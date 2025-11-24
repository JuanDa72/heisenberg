import { useState, useCallback, useEffect } from 'react';
import { chatbotService, chatbotMessagesService } from '@/services';
import type { ChatbotSession, ChatbotMessage } from '@/types/chatbot.types';
import type { User } from '@/types/user.types';

export const useChat = (user: User | null) => {
  const [currentSession, setCurrentSession] = useState<ChatbotSession | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sending, setSending] = useState(false);

  /**
   * Inicializa o obtiene la sesión activa del chat
   */
  const initializeSession = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingSession(true);
      const activeSessions = await chatbotService.getActiveSession(user.id);
      
      if (activeSessions && activeSessions.length > 0) {
        const session = activeSessions[0];
        setCurrentSession(session);
        
        // Cargar mensajes de la sesión existente
        try {
          const sessionMessages = await chatbotMessagesService.getMessagesBySessionId(session.id);
          setMessages(sessionMessages);
        } catch {
          // Si no hay mensajes, simplemente continuamos con sesión vacía
          setMessages([]);
        }
      } else {
        // Crear nueva sesión
        const newSession = await chatbotService.createSession({ user_id: user.id });
        setCurrentSession(newSession);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error inicializando sesión:', error);
      throw error;
    } finally {
      setLoadingSession(false);
    }
  }, [user]);

  /**
   * Crea una nueva sesión de chat
   */
  const createNewSession = useCallback(async () => {
    if (!user) return;

    try {
      const newSession = await chatbotService.createSession({ user_id: user.id });
      setCurrentSession(newSession);
      setMessages([]);
      return newSession;
    } catch (error) {
      console.error('Error creando nueva sesión:', error);
      throw error;
    }
  }, [user]);

  /**
   * Envía un mensaje y obtiene respuesta del bot
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!currentSession || !message.trim()) {
        throw new Error('Sesión no válida o mensaje vacío');
      }

      try {
        setSending(true);

        // Agregar mensaje del usuario
        const userMessage: ChatbotMessage = {
          id: Date.now(),
          session_id: currentSession.id,
          sender: 'user',
          message: message.trim(),
          created_at: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Enviar mensaje y obtener respuesta
        const response = await chatbotService.sendMessage(
          currentSession.id,
          message.trim()
        );

        // Agregar respuesta del bot
        const botMessage: ChatbotMessage = {
          id: Date.now() + 1,
          session_id: currentSession.id,
          sender: 'bot',
          message: response.botResponse,
          created_at: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Actualizar título de sesión si es el primer mensaje
        if (messages.length === 0) {
          const updatedSession = await chatbotService.updateSession(
            currentSession.id,
            { title: message.substring(0, 50) }
          );
          setCurrentSession(updatedSession);
        }

        return response;
      } catch (error) {
        // Rollback del mensaje del usuario en caso de error
        setMessages((prev) => prev.slice(0, -1));
        throw error;
      } finally {
        setSending(false);
      }
    },
    [currentSession, messages.length]
  );

  /**
   * Edita un mensaje existente y regenera la respuesta
   */
  const editAndRegenerateMessage = useCallback(
    async (messageId: number, newMessage: string) => {
      if (!currentSession) {
        throw new Error('Sesión no válida');
      }

      try {
        setSending(true);
        await chatbotMessagesService.editMessageAndRegenerate(messageId, newMessage);
        
        // Recargar mensajes de la sesión
        const updatedMessages = await chatbotMessagesService.getMessagesBySessionId(
          currentSession.id
        );
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Error editando y regenerando mensaje:', error);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [currentSession]
  );

  /**
   * Elimina un mensaje de la sesión
   */
  const deleteMessage = useCallback(
    async (messageId: number) => {
      try {
        await chatbotMessagesService.deleteChatbotMessage(messageId);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (error) {
        console.error('Error eliminando mensaje:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Elimina la sesión actual y resetea el estado
   */
  const deleteSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await chatbotService.deleteSession(currentSession.id);
      setCurrentSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      throw error;
    }
  }, [currentSession]);

  // Inicializar sesión cuando el usuario cambia
  useEffect(() => {
    if (user) {
      initializeSession();
    }
  }, [user, initializeSession]);

  return {
    currentSession,
    messages,
    loadingSession,
    sending,
    initializeSession,
    createNewSession,
    sendMessage,
    editAndRegenerateMessage,
    deleteMessage,
    deleteSession,
  };
};
