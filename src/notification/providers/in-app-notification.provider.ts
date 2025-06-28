import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationType } from "../entities/notification.entity";
import { Notification } from "../entities/notification.entity";

@Injectable()
export class InAppNotificationProvider implements NotificationProvider {
  readonly type = NotificationType.IN_APP;
  private readonly logger = new Logger(InAppNotificationProvider.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async send(
    recipient: string,
    subject: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // For in-app notifications, we store them in the database
      // The frontend can then fetch these notifications
      const notification = this.notificationRepository.create({
        type: NotificationType.IN_APP,
        recipient,
        subject,
        message,
        metadata,
        status: "SENT" as any, // In-app notifications are immediately "sent"
        sentAt: new Date(),
      });

      await this.notificationRepository.save(notification);
      this.logger.log(`[IN-APP] Stored notification for user: ${recipient}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to store in-app notification for ${recipient}:`,
        error.message
      );
      return false;
    }
  }
}
