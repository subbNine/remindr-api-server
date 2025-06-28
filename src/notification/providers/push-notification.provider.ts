import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationType } from "../entities/notification.entity";

@Injectable()
export class PushNotificationProvider implements NotificationProvider {
  readonly type = NotificationType.PUSH;
  private readonly logger = new Logger(PushNotificationProvider.name);

  constructor(private configService: ConfigService) {}

  async send(
    recipient: string, // device token
    subject: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // For MVP, we'll simulate push notification sending
      // In production, you would use Firebase Cloud Messaging, OneSignal, or similar
      this.logger.log(
        `[PUSH] To device: ${recipient} | Title: ${subject} | Body: ${message}`
      );

      // Simulate push notification sending delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Simulate occasional failures for testing
      if (Math.random() < 0.15) {
        // 15% failure rate for testing
        throw new Error("Push notification service temporarily unavailable");
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to ${recipient}:`,
        error.message
      );
      return false;
    }
  }
}
