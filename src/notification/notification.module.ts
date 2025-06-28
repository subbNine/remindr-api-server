import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { Notification } from "./entities/notification.entity";
import { EmailNotificationProvider } from "./providers/email-notification.provider";
import { InAppNotificationProvider } from "./providers/in-app-notification.provider";
import { PushNotificationProvider } from "./providers/push-notification.provider";

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailNotificationProvider,
    InAppNotificationProvider,
    PushNotificationProvider,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
