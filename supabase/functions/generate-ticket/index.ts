import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const { data } = await req.json()

    if (!data || !data.email || !data.userFirstname) {
      throw new Error('Missing required fields: email and userFirstname')
    }

    // Generate the ticket email HTML
    const htmlContent = generateTicketTemplate(data)

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Legal AI Summit <noreply@lawgic.institute>',
        to: [data.email],
        subject: data.subject || 'Tu acceso al Legal AI Summit México 2025',
        html: htmlContent,
        tags: [
          {
            name: 'category',
            value: 'ticket-email'
          },
          {
            name: 'user-id',
            value: data.userId || 'unknown'
          }
        ]
      })
    })

    const result = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${result.message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        message: 'Ticket email sent successfully'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error sending ticket email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function generateTicketTemplate(data: any): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso al Cronograma - Legal AI Summit México 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        @keyframes rotateGradient {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes subtleGlow {
            0%, 100% {
                box-shadow: 
                    0 0 20px 5px rgba(59, 130, 246, 0.3),
                    0 0 30px 10px rgba(139, 92, 246, 0.2),
                    0 0 40px 15px rgba(250, 204, 21, 0.1);
            }
        }
        
        .ticket-wrapper {
            position: relative;
            margin: 30px auto;
            width: 410px;
            padding: 5px;
            border-radius: 29px;
            background: transparent;
        }
        
        .ticket-wrapper::before {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: conic-gradient(
                from 0deg,
                #3b82f6,
                #5b6ef8,
                #8b5cf6,
                #b168f2,
                #facc15,
                #fde047,
                #facc15,
                #5b6ef8,
                #3b82f6
            );
            border-radius: 29px;
            animation: rotateGradient 3s linear infinite;
            z-index: -1;
        }
        
        .ticket-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #1a1a2e;
            border-radius: 24px;
            z-index: -1;
        }
    </style>
</head>
<body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
    <div style="box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px; overflow: hidden; background-color: white;">
        <div style="background: #000000; padding: 20px 15px; text-align: center; color: white; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);">
            <img src="https://lawgic.institute/Summit2025/legal-ai-summit-og-image.jpg" alt="Cumbre de IA Legal" style="max-width: 480px; height: auto;">
        </div>
        <div style="padding: 25px 20px; background-color: white; border-radius: 0 0 12px 12px;">
            <h2 style="font-size: 26px; font-weight: bold; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #facc15 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px; text-align: center;">Tu acceso al LEGAL AI SUMMIT</h2>
            <p style="margin-bottom: 10px; font-size: 15px;">¡Nos emociona darte la bienvenida al <strong style="font-weight: bold;">Legal AI Summit México 2025</strong>! El evento líder en la intersección entre la inteligencia artificial y el derecho en México que se llevará a cabo del <strong style="font-weight: bold;">lunes 29 de septiembre al viernes 3 de octubre de 2025.</strong></p>
            <p style="font-size: 15px; color: #666; margin-bottom: 10px; text-align: center;">¡Aquí está tu ticket de acceso personal!<br><span style="color: #dc2626; font-size: 13px;">Compartirlo puede hacer que se desactive definitivamente</span></p>
            
           <!-- Ticket en el correo -->
           <div class="ticket-wrapper">
 <table width="400" cellpadding="0" cellspacing="0" style="margin: 0 auto; background: linear-gradient(145deg, #1e3a8a 0%, #3730a3 50%, #312e81 100%); border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), 0 0 50px rgba(59, 130, 246, 0.2);">
        
        <!-- Sección principal del ticket -->
        <tr>
            <td style="padding: 30px; background: linear-gradient(145deg, rgba(59, 130, 246, 0.95) 0%, rgba(139, 92, 246, 0.92) 100%), url('https://lawgic.institute/Summit2025/ritchiero_lady_justice_a_blueprint-style_vector_art_piece_set_3ce899c7-06e0-42dd-9db7-e21bb75c0b0b_3.png') center center / contain no-repeat; border-bottom: 3px dashed rgba(250, 204, 21, 0.8); position: relative; filter: brightness(1.1);">
                
                <!-- Header con logo -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding-bottom: 10px;">
                            <img src="https://lawgic.institute/hero-image.png" alt="LEGAL AI SUMMIT 2025" style="max-width: 320px; width: 100%; height: auto; filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));">
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding-bottom: 12px;">
                            <p style="font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.9); margin: 0; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);">
                                ${data.eventDates || 'DEL 29 DE SEPTIEMBRE AL 3 OCTUBRE'}
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Área central con QR -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding: 10px 0;">
                            <!-- Contenedor del QR -->
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto; background: rgba(255, 255, 255, 0.98); border-radius: 10px; padding: 10px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);">
                                <tr>
                                    <td style="text-align: center;">
                                        <!-- QR Code placeholder - reemplazar con imagen real -->
                                        <img src="https://agenda.lawgic.institute/frame.png" alt="QR Code" style="width: 140px; height: 140px; image-rendering: pixelated;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer con código -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding-top: 10px;">
                            <!-- Código del ticket -->
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: 1px;">
                                CODE: LAI2025-${data.userId || 'WEB'}-${Math.random().toString(36).substr(2, 3).toUpperCase()}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding-bottom: 8px;">
                            <!-- Código de barras simulado -->
                            <div style="display: inline-block; height: 25px; margin-bottom: 8px;">
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 15px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 18px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 15px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 16px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 15px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 18px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 14px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 17px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 15px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 16px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 18px; width: 3px; margin: 0 1px;"></span>
                                <span style="display: inline-block; background: #b8b8b8; height: 20px; width: 2px; margin: 0 1px;"></span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">
                            <!-- Logo LAWGIC -->
                            <img src="https://lawgic.institute/lawgic-logo-blanco.png" alt="LAWGIC" style="max-width: 120px; width: 60%; height: auto; opacity: 0.95; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Sección de información del asistente -->
        <tr>
            <td style="background: linear-gradient(145deg, rgba(248, 249, 250, 0.98) 0%, rgba(233, 236, 239, 0.95) 100%); border-radius: 0 0 20px 20px; padding: 16px 30px 30px 30px; position: relative;">
                
                <!-- Holograma simulado -->
                <div style="position: absolute; top: 18px; right: 26px; width: 62px; height: 62px; border-radius: 10px; background: linear-gradient(180deg, #bfc5cf 0%, #7b8696 100%); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35); overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: conic-gradient(from 0deg, hsl(200 100% 65% / 0.55), hsl(260 100% 65% / 0.55), hsl(320 100% 65% / 0.55), hsl(20 100% 65% / 0.55), hsl(80 100% 65% / 0.55), hsl(140 100% 65% / 0.55), hsl(200 100% 65% / 0.55)); mix-blend-mode: screen; position: relative;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 56px; height: 56px; background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(230,238,255,0.95) 45%, rgba(195,210,255,0.92) 100%); -webkit-mask-image: url('https://lawgic.institute/Summit.png'); mask-image: url('https://lawgic.institute/Summit.png'); -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: 92% auto; mask-size: 92% auto; opacity: 0.96;"></div>
                    </div>
                </div>

                <!-- Contenido de información -->
                <table width="100%" cellpadding="0" cellspacing="0" style="padding-right: 90px;">
                    <tr>
                        <td style="text-align: left;">
                            <h2 style="color: #1a1a2e; font-size: 18px; font-weight: 700; margin: 0 0 5px 0; text-align: left;">
                                LEGAL AI SUMMIT 2025
                            </h2>
                            <p style="color: #666; font-size: 12px; margin: 2px 0; font-weight: 500; text-align: left;">
                                ${data.eventDates || 'DEL 29 DE SEPTIEMBRE AL 3 OCTUBRE'}
                            </p>
                            <p style="color: #666; font-size: 11px; margin: 2px 0 8px 0; font-weight: 600; text-align: left;">
                                ORGANIZADO POR: ${data.eventOrganizer || 'LAWGIC'}
                            </p>
                            
                            <!-- Nombre del asistente -->
                            <div style="background: linear-gradient(135deg, rgba(14, 8, 254, 0.08) 0%, rgba(0, 212, 255, 0.08) 100%); border-radius: 12px; padding: 12px 18px; border: 2px solid rgba(0, 212, 255, 0.2); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); margin: 8px 0 0 0; position: relative; text-align: left;">
                                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(135deg, #00d4ff 0%, #5b3fff 100%); border-radius: 12px 12px 0 0;"></div>
                                <span style="font-size: 16px; font-weight: 700; color: #1a1a2e; text-transform: uppercase; letter-spacing: 0.5px; background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: left;">
                                   ${data.userFirstname || 'Asistente'}
                                </span>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
           </div>
           <!-- fin del ticket correo -->
           
            <p style="font-size: 16px; color: #666; margin-bottom: 30px; text-align: center;">Haz clic en el enlace mágico para acceder al cronograma del evento</p>
            <div style="text-align: center;">
                <a href="https://agenda.lawgic.institute" style="display: inline-block; background: linear-gradient(135deg, #0F1BF7 0%, #6366f1 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; margin: 20px 0; transition: transform 0.2s;">
                    Acceder al Cronograma
                </a>
            </div>

            <div style="text-align: center; margin: 15px 0;">
                <span style="font-size: 16px; color: #aaa;"></span>
            </div>

            <div style="text-align: center; margin-top: 15px;">
                <a href="https://agenda.lawgic.institute/ticket/${data.userId || 'user'}" style="display: inline-block; background: #fff; color: #0F1BF7; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; margin: 20px 0; transition: transform 0.2s; border: 2px solid #0F1BF7;">
                    Ver Ticket
                </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #facc15; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; color: #92400e; box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);">
                <strong style="font-weight: bold; color: #78350f;">⚠️ Información de Seguridad:</strong>
                <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
                    <li>No compartas este enlace con otras personas</li>
                    <li>Si no solicitaste este acceso, ignora este email</li>
                </ul>
            </div>
            <div style="background-color: #f0f9ff; border-left: 4px solid #0F1BF7; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #0F1BF7; margin-top: 0; font-weight: bold;">📋 Instrucciones</h3>
                <ol>
                    <li>Haz clic en el botón "Acceder al Cronograma"</li>
                    <li>Serás redirigido automáticamente a la aplicación</li>
                    <li>Podrás ver el cronograma completo del evento</li>
                </ol>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p><strong style="font-weight: bold;">¿Necesitas ayuda?</strong></p>
                <div style="margin: 15px 0;">
                    <a href="https://www.loom.com/share/a7d3cddf08b84730b925e020af00c40d?sid=e06425df-f79f-461a-ab41-355c37446edf" style="display: inline-block; background: linear-gradient(135deg, #625DF5 0%, #8B5CF6 100%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 10px 0; transition: transform 0.2s;">
                        🎥 Video Tutorial - Cómo Acceder a la Agenda
                    </a>
                </div>
                <p>Contacta al administrador del evento</p>
                <p>Email: ricardo.rodriguez@getlawgic.com</p>
            </div>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; margin-top: -12px; padding-top: 32px; border-radius: 0 0 12px 12px;">
            <p>© 2025 Legal AI Summit México 2025. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>`
}
