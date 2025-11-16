import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { error } from 'console';

config();


const transporter = nodemailer.createTransport({
service: 'Gmail',
auth: {
user: process.env.GMAIL_USER,
pass: process.env.GMAIL_PASSWORD,
    },
});



export async function sendVerificationEmail(userEmail: string, verificationToken: string): Promise<void> {
  const verificationUrl = `http://localhost:3000/users/verify-email/?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: '¡Bienvenido a Heisenberg! Verifica tu correo electrónico',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a1929 0%, #1a2f4a 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(17, 24, 39, 0.95); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          
          <tr>
            <td align="center" style="padding: 50px 40px 30px; background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%);">
              <h1 style="color: #60A5FA; margin: 0 0 10px; font-size: 32px; font-weight: 600; letter-spacing: 4px;">HEISENBERG</h1>
              <p style="color: #94A3B8; margin: 0; font-size: 14px; letter-spacing: 1px;">Asistente Virtual de Droguería</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 50px;">
              <h2 style="color: #F1F5F9; margin: 0 0 20px; font-size: 24px; font-weight: 600;">¡Bienvenido a Heisenberg!</h2>
              
              <p style="color: #CBD5E1; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Gracias por registrarte en nuestra plataforma. Estás a solo un paso de acceder a tu asistente virtual de droguería.
              </p>
              
              <p style="color: #CBD5E1; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Para activar tu cuenta y comenzar a utilizar todos nuestros servicios, verifica tu dirección de correo electrónico:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background: rgba(30, 41, 59, 0.5); border-left: 3px solid #60A5FA; padding: 20px; margin: 30px 0; border-radius: 6px;">
                <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #E2E8F0;">⏱️ Nota importante:</strong><br>
                  Este enlace de verificación expirará en <strong style="color: #60A5FA;">1 hora</strong>. Si no completaste el registro, puedes ignorar este mensaje de forma segura.
                </p>
              </div>
              
              </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 50px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(96, 165, 250, 0.2);">
              <p style="color: #64748B; font-size: 12px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
                Este es un correo automático, por favor no responder.
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0; text-align: center;">
                © 2025 Official Heisenberg Team. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; 
  }
}
