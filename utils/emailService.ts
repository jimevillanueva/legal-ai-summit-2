// Email service que usa Supabase Edge Functions
import { supabase } from './supabaseClient';

export interface EmailUser {
  id: string;
  email: string;
  name: string;
}

export interface SendTicketEmailOptions {
  to: string;
  user: EmailUser;
  confirmationUrl: string;
  subject?: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Sends a ticket email using Supabase Edge Function
   */
  public async sendTicketEmail(options: SendTicketEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      console.log('🚀 Enviando email via Supabase Edge Function...');
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const ticketEmailData = {
        userFirstname: options.user.name,
        email: options.to,
        amount: 1200,
        currency: "MXN",
        planType: "Individual",
        orderDate: new Date().toLocaleDateString("es-MX"),
        paymentMethod: "Tarjeta de crédito/débito",
        courseTitle: "Legal AI Summit México 2025",
        courseId: "155",
        // Datos adicionales del ticket
        userId: options.user.id,
        confirmationUrl: options.confirmationUrl,
        eventDates: 'Del 29 de septiembre al 3 de octubre de 2025',
        eventOrganizer: 'LAWGIC'
      };

      // Llamada a la Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke('generate-ticket', {
        body: {
          data: ticketEmailData
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        return {
          success: false,
          error: error.message || 'Error al enviar el email'
        };
      }

      console.log('✅ Email sent successfully via Supabase:', data);
      return {
        success: true,
        messageId: data?.messageId || 'supabase-email-sent'
      };

    } catch (error: any) {
      console.error('❌ Error in sendTicketEmail:', error);
      return {
        success: false,
        error: error.message || 'Error inesperado'
      };
    }
  }

  /**
   * Sends a magic link email for authentication
   */
  public async sendMagicLinkEmail(email: string, magicLinkUrl: string, userName: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    const user: EmailUser = {
      id: 'temp-id',
      email,
      name: userName
    };

    return this.sendTicketEmail({
      to: email,
      user,
      confirmationUrl: magicLinkUrl,
      subject: 'Acceso al Legal AI Summit México 2025'
    });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Export default for easier importing
export default emailService;
