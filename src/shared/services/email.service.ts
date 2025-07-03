import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY is not defined');
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const from = process.env.SENDGRID_FROM;
    if (!from) throw new Error('SENDGRID_FROM is not defined');
    try {
      await sgMail.send({
        to,
        from,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      throw error;
    }
  }
}
