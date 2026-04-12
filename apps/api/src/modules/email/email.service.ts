import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(params: { to: string | string[]; subject: string; html: string; from?: string }) {
    try {
      const data = await this.resend.emails.send({
        from: params.from || 'Pretalk Hub <noreply@pretalk.me>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return data;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendInvitation(email: string, tenantName: string) {
    return this.send({
      to: email,
      subject: `Invitation à rejoindre ${tenantName} sur Pretalk Hub`,
      html: `
        <h1>Bonjour !</h1>
        <p>Vous avez été invité à rejoindre l'équipe de <strong>${tenantName}</strong> sur Pretalk Hub.</p>
        <p>Pretalk Hub est la solution IA WhatsApp n°1 pour booster vos ventes e-commerce.</p>
        <a href="${process.env.CORS_ORIGIN}/auth/accept-invite?email=${email}">Accepter l'invitation</a>
      `,
    });
  }
}
