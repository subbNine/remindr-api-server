import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationType } from "../entities/notification.entity";

// Add SMS to the NotificationType enum
export enum ExtendedNotificationType {
  EMAIL = "EMAIL",
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  SMS = "SMS",
}

@Injectable()
export class SmsNotificationProvider implements NotificationProvider {
  readonly type = ExtendedNotificationType.SMS as any; // Cast for demo purposes
  private readonly logger = new Logger(SmsNotificationProvider.name);

  constructor(private configService: ConfigService) {}

  async send(
    recipient: string, // phone number
    subject: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // For MVP, we'll simulate SMS sending
      // In production, you would use Twilio, AWS SNS, or similar
      this.logger.log(`[SMS] To: ${recipient} | Message: ${message}`);

      // Simulate SMS sending delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Simulate occasional failures for testing
      if (Math.random() < 0.05) {
        // 5% failure rate for testing
        throw new Error("SMS service temporarily unavailable");
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${recipient}:`, error.message);
      return false;
    }
  }
}
