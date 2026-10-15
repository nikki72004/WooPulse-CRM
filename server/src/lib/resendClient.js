import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from './logger.js';

export class EmailService {
  constructor() {
    this.apiKey = ENV.RESEND_API_KEY;
    this.isLive = this.apiKey && this.apiKey.startsWith('re_') && !this.apiKey.includes('mock');
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isLive) {
      logger.info('Simulated email dispatch (development mode)', { to, subject });
      return {
        success: true,
        id: `mock_resend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        mode: 'simulated',
      };
    }

    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: ENV.EMAIL_FROM,
          to: [to],
          subject,
          html: html || `<p>${text}</p>`,
          text,
          reply_to: ENV.EMAIL_REPLY_TO,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      return {
        success: true,
        id: response.data?.id,
        mode: 'live',
      };
    } catch (err) {
      logger.error('Resend email delivery failure:', { error: err.response?.data || err.message });
      throw new Error(err.response?.data?.message || err.message);
    }
  }
}

export const emailService = new EmailService();
