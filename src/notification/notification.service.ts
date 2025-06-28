import { Injectable, Logger, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationProvider } from "./interfaces/notification-provider.interface";
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from "./entities/notification.entity";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { EmailNotificationProvider } from "./providers/email-notification.provider";
import { InAppNotificationProvider } from "./providers/in-app-notification.provider";
import { PushNotificationProvider } from "./providers/push-notification.provider";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly providers: Map<NotificationType, NotificationProvider>;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly inAppProvider: InAppNotificationProvider,
    private readonly pushProvider: PushNotificationProvider
  ) {
    // Initialize providers map
    this.providers = new Map<NotificationType, NotificationProvider>([
      [NotificationType.EMAIL, emailProvider],
      [NotificationType.IN_APP, inAppProvider],
      [NotificationType.PUSH, pushProvider],
    ]);
  }

  async sendNotification(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    const { type, recipient, subject, message, metadata, userId } =
      createNotificationDto;

    // Create notification record in database
    const notification = this.notificationRepository.create({
      type,
      recipient,
      subject,
      message,
      metadata,
      userId,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    try {
      // Get the appropriate provider
      const provider = this.providers.get(type);
      if (!provider) {
        throw new Error(`No provider found for notification type: ${type}`);
      }

      // Send the notification
      const success = await provider.send(
        recipient,
        subject,
        message,
        metadata
      );

      // Update notification status
      if (success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        this.logger.log(`Notification ${notification.id} sent successfully`);
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = "Provider returned false";
        this.logger.error(`Notification ${notification.id} failed to send`);
      }

      await this.notificationRepository.save(notification);
      return notification;
    } catch (error) {
      // Update notification status to failed
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      await this.notificationRepository.save(notification);

      this.logger.error(
        `Notification ${notification.id} failed:`,
        error.message
      );
      throw error;
    }
  }

  async sendMultipleNotifications(
    notifications: CreateNotificationDto[]
  ): Promise<Notification[]> {
    const results: Notification[] = [];

    for (const notificationDto of notifications) {
      try {
        const result = await this.sendNotification(notificationDto);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to send notification:`, error.message);
        // Continue with other notifications even if one fails
      }
    }

    return results;
  }

  async getUserNotifications(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  async getNotificationStats(userId?: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    const query =
      this.notificationRepository.createQueryBuilder("notification");

    if (userId) {
      query.where("notification.userId = :userId", { userId });
    }

    const [total, sent, failed, pending] = await Promise.all([
      query.getCount(),
      query
        .where("notification.status = :status", {
          status: NotificationStatus.SENT,
        })
        .getCount(),
      query
        .where("notification.status = :status", {
          status: NotificationStatus.FAILED,
        })
        .getCount(),
      query
        .where("notification.status = :status", {
          status: NotificationStatus.PENDING,
        })
        .getCount(),
    ]);

    return { total, sent, failed, pending };
  }

  async retryFailedNotifications(): Promise<number> {
    const failedNotifications = await this.notificationRepository.find({
      where: { status: NotificationStatus.FAILED },
      order: { createdAt: "ASC" },
    });

    let retryCount = 0;
    for (const notification of failedNotifications) {
      try {
        const provider = this.providers.get(notification.type);
        if (!provider) continue;

        const success = await provider.send(
          notification.recipient,
          notification.subject,
          notification.message,
          notification.metadata
        );

        if (success) {
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
          notification.errorMessage = null;
          await this.notificationRepository.save(notification);
          retryCount++;
        }
      } catch (error) {
        this.logger.error(
          `Retry failed for notification ${notification.id}:`,
          error.message
        );
      }
    }

    return retryCount;
  }

  // Method to add a new provider dynamically
  addProvider(type: NotificationType, provider: NotificationProvider): void {
    this.providers.set(type, provider);
    this.logger.log(`Added new notification provider for type: ${type}`);
  }
}
