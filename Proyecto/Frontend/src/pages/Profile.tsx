import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Lock, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User as UserType } from "@/types/user.types";
import apiClient from "@/services/api.config";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        navigate("/");
        return;
      }

      const userData: UserType = JSON.parse(savedUser);
      setUser(userData);
      setUsername(userData.username);
      setEmail(userData.email);
      setUserRole(userData.role as "admin" | "user");
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({ title: "Error", description: "Error al cargar el perfil", variant: "destructive" });
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await apiClient.put(`/users/${user.id}`, {
        username: username,
      });

      const updatedUser = { ...user, username };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({
        title: "Perfil actualizado",
        description: "Tu nombre se ha actualizado correctamente.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar perfil";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.put(`/users/${user.id}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar contraseña";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await apiClient.delete(`/users/${user.id}`);
      localStorage.removeItem("user");

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente.",
      });
      navigate("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar cuenta";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-royal to-deep-purple flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-royal to-deep-purple p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10"
          onClick={() => navigate("/chat")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Chat
        </Button>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información de la Cuenta
                </CardTitle>
                <Badge variant={userRole === "admin" ? "default" : "secondary"}>
                  {userRole === "admin" ? "Administrador" : "Usuario"}
                </Badge>
              </div>
              <CardDescription className="text-gray-400">{email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-white">
                  Nombre de Usuario
                </Label>
                <Input
                  id="displayName"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/60 border-white/20 text-white mt-2"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Actualizar Nombre
              </Button>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-white">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/60 border-white/20 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-white">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/60 border-white/20 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/60 border-white/20 text-white mt-2"
                />
              </div>
              <Button 
                onClick={handleChangePassword} 
                className="w-full"
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account Card */}
          <Card className="bg-black/40 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Zona Peligrosa
              </CardTitle>
              <CardDescription className="text-gray-400">
                Esta acción no se puede deshacer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Eliminar Cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-navy border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos.
                      No podrás recuperar tu cuenta después de eliminarla.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-black/60 text-white border-white/20 hover:bg-black/80">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar Cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
