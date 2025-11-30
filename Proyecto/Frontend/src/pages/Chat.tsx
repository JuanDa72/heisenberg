import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoImage from "@/assets/heisenberg-logo.png";
import { Send, Plus, Settings, User, HelpCircle, LogOut, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatbotService, chatbotMessagesService } from "@/services";
import type { User as UserType } from "@/types/user.types";
import type { ChatbotSession, ChatbotMessage } from "@/types/chatbot.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<UserType | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [displayName, setDisplayName] = useState("Usuario");
  const [currentSession, setCurrentSession] = useState<ChatbotSession | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser) {
      toast({
        title: "Sesión expirada",
        description: "Por favor inicia sesión nuevamente.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const userData: UserType = JSON.parse(savedUser);
      setUser(userData);
      setDisplayName(userData.username);
      setUserRole(userData.role as "admin" | "user");
      return userData;
    } catch (error) {
      console.error('Error al parsear datos del usuario:', error);
      navigate("/");
      return null;
    }
  }, [navigate, toast]);

  const initializeSession = useCallback(async (userData: UserType) => {
    try {
      setLoadingSession(true);
      const activeSessions = await chatbotService.getActiveSession(userData.id);

      if (activeSessions && activeSessions.length > 0) {
        const session = activeSessions[0];
        setCurrentSession(session);

        try {
          const sessionMessages = await chatbotMessagesService.getMessagesBySessionId(session.id);
          setMessages(sessionMessages);
        } catch {
          setMessages([]);
        }
      } else {
        const newSession = await chatbotService.createSession({ user_id: userData.id });
        setCurrentSession(newSession);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error al inicializar sesión:', error);
      toast({
        title: "Error",
        description: "No se pudo inicializar la sesión de chat",
        variant: "destructive",
      });
    } finally {
      setLoadingSession(false);
    }
  }, [toast]);

  useEffect(() => {
    const userData = checkAuth();
    if (userData) {
      initializeSession(userData);
    }
  }, [checkAuth, initializeSession]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    navigate("/");
  };

  const handleProductsClick = () => {
    if (userRole === "admin") {
      navigate("/products");
    } else {
      toast({
        title: "Acceso Denegado",
        description: "Solo los administradores pueden acceder a esta sección.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

    try {
      const newSession = await chatbotService.createSession({ user_id: user.id });
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear nueva sesión';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSession || sending) return;

    const messageToSend = input;
    setInput("");
    setSending(true);

    try {
      await chatbotService.sendMessage(currentSession.id, messageToSend);

      if (!currentSession.title) {
        try {
          const updatedSession = await chatbotService.updateSession(currentSession.id, {
            title: messageToSend.substring(0, 50),
          });
          if (updatedSession) {
            setCurrentSession(updatedSession);
          }
        } catch (err) {
          console.error('Error al actualizar título:', err);
        }
      }

      try {
        const updatedMessages = await chatbotMessagesService.getMessagesBySessionId(currentSession.id);
        setMessages(updatedMessages);
      } catch (err) {
        console.error('Error al recargar mensajes:', err);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar mensaje';

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleStartEditing = (message: ChatbotMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.message);
  };

  const handleCancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleConfirmEditing = async () => {
    if (!currentSession || editingMessageId === null || !editingText.trim()) return;

    try {
      setSending(true);
      await chatbotMessagesService.editMessageAndRegenerate(editingMessageId, editingText.trim());

      const updatedMessages = await chatbotMessagesService.getMessagesBySessionId(currentSession.id);
      setMessages(updatedMessages);
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al editar mensaje';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text: string) => {
    const escaped = text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (loadingSession) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-foreground">Inicializando chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Heisenberg Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="font-bold text-sidebar-foreground">Heisenberg</h2>
              <p className="text-xs text-sidebar-foreground/70">
                Asistente de Farmacia
              </p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80"
          >
            <Plus className="h-4 w-4" />
            Nuevo Chat
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-2">
          <nav className="space-y-1">
            <Button
              onClick={handleProductsClick}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-sidebar-accent"
            >
              <Package className="h-4 w-4" />
              Productos {userRole !== "admin" && "(Admin)"}
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-sidebar-accent"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Button>
          </nav>
        </div>

        {/* Footer - User Info */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <p className="text-xs text-sidebar-foreground/70 mb-1">Sesión activa</p>
            <p className="text-sm font-medium text-sidebar-foreground">{displayName}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Heisenberg Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h3 className="font-semibold text-foreground">Chat con Heisenberg</h3>
              <p className="text-xs text-muted-foreground">
                {currentSession ? "En línea" : "Inicializando..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/catalogo")}
            >
              <Package className="h-4 w-4" />
              Ver catálogo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.sender === "bot"
                      ? "bg-primary/10"
                      : "bg-accent/10"
                  }`}
                >
                  {message.sender === "bot" ? (
                    <img 
                      src={logoImage} 
                      alt="Heisenberg" 
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <User className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 max-w-2xl">
                  <div
                    className={`rounded-2xl p-4 ${
                      message.sender === "bot"
                        ? "bg-card shadow-card"
                        : "bg-accent/20"
                    }`}
                  >
                    {editingMessageId === message.id && message.sender === "user" ? (
                      <div className="space-y-2">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          disabled={sending}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditing}
                            disabled={sending}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleConfirmEditing}
                            disabled={sending || !editingText.trim()}
                          >
                            Guardar y regenerar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className="text-foreground leading-relaxed flex-1"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.message) }}
                        />
                        {message.sender === "user" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEditing(message)}
                            disabled={sending}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                  <img 
                    src={logoImage} 
                    alt="Heisenberg" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex-1 max-w-2xl rounded-2xl p-4 bg-card shadow-card">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribir el nombre del medicamento..."
                  className="pr-12 py-6 bg-input border-border/50 focus:border-primary rounded-2xl resize-none"
                  disabled={sending || !currentSession}
                />
              </div>
              <Button                
                onClick={handleSend}
                disabled={!input.trim() || sending || !currentSession}
                className="h-12 w-12 rounded-full bg-accent hover:bg-accent/90 shadow-lg"
                size="icon"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
