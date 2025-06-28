import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  NotificationProvider,
  NotificationResult,
} from "../interfaces/notification-provider.interface";
import { NotificationType } from "../entities/notification.entity";

@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  readonly type = NotificationType.EMAIL;
  private readonly logger = new Logger(EmailNotificationProvider.name);

  constructor(private configService: ConfigService) {}

  async send(
    recipient: string,
    subject: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // For MVP, we'll simulate email sending
      // In production, you would use nodemailer or a service like SendGrid
      this.logger.log(
        `[EMAIL] To: ${recipient} | Subject: ${subject} | Message: ${message}`
      );

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate occasional failures for testing
      if (Math.random() < 0.1) {
        // 10% failure rate for testing
        throw new Error("Email service temporarily unavailable");
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${recipient}:`, error.message);
      return false;
    }
  }
}
