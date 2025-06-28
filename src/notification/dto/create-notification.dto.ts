import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType } from "../entities/notification.entity";

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, description: "Type of notification" })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: "Recipient (email, user ID, or device token)" })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ description: "Notification subject/title" })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: "Notification message content" })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: "Additional metadata for the notification",
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: "User ID if notification is for a specific user",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
