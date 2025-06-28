import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReminderController } from "./reminder.controller";
import { ReminderService } from "./reminder.service";
import { DailyReminderCron } from "./cron/daily-reminder.cron";
import { Reminder } from "./entities/reminder.entity";
import { Group } from "../group/entities/group.entity";
import { Contact } from "../contact/entities/contact.entity";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, Group, Contact]),
    NotificationModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService, DailyReminderCron],
  exports: [ReminderService],
})
export class ReminderModule {}
