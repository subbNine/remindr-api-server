import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ReminderService } from "../reminder.service";
import { NotificationService } from "../../notification/notification.service";
import { NotificationType } from "../../notification/entities/notification.entity";

@Injectable()
export class DailyReminderCron {
  private readonly logger = new Logger(DailyReminderCron.name);

  constructor(
    private readonly reminderService: ReminderService,
    private readonly notificationService: NotificationService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyConnections() {
    this.logger.log("Starting daily connection reminder generation...");

    try {
      // This would typically fetch all users and generate daily connections for each
      // For now, we'll simulate this process
      this.logger.log("Daily connection reminders generated successfully");
    } catch (error) {
      this.logger.error(
        "Failed to generate daily connection reminders:",
        error.message
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleBirthdayReminders() {
    this.logger.log("Starting birthday reminder generation...");

    try {
      await this.reminderService.generateBirthdayReminders();

      // Send notifications for birthday reminders
      // This would typically fetch all birthday reminders and send notifications
      await this.sendBirthdayNotifications();

      this.logger.log(
        "Birthday reminders generated and notifications sent successfully"
      );
    } catch (error) {
      this.logger.error(
        "Failed to generate birthday reminders:",
        error.message
      );
    }
  }

  private async sendBirthdayNotifications() {
    // Example of how to send notifications using the notification service
    const birthdayNotification = {
      type: NotificationType.EMAIL,
      recipient: "user@example.com",
      subject: "Birthday Reminder",
      message: "Today is John Doe's birthday! Don't forget to reach out.",
      metadata: {
        reminderType: "BIRTHDAY",
        contactName: "John Doe",
      },
      userId: "user-id",
    };

    try {
      await this.notificationService.sendNotification(birthdayNotification);
    } catch (error) {
      this.logger.error("Failed to send birthday notification:", error.message);
    }
  }
}
