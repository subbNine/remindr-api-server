import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GroupModule } from "./group/group.module";
import { ContactModule } from "./contact/contact.module";
import { ReminderModule } from "./reminder/reminder.module";
import { NotificationModule } from "./notification/notification.module";
import { OtpModule } from "./otp/otp.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    GroupModule,
    ContactModule,
    ReminderModule,
    NotificationModule,
    OtpModule,
    AdminModule,
  ],
})
export class AppModule {}
