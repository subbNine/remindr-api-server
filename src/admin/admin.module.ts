import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { User } from "../user/entities/user.entity";
import { OtpModule } from "../otp/otp.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), OtpModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
