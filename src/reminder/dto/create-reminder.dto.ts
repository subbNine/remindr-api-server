import { IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReminderType } from '../../common/enums/reminder-type.enum';

export class CreateReminderDto {
  @ApiProperty({ enum: ReminderType, description: 'Type of reminder' })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({ description: 'Date for the reminder' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Contact ID for the reminder' })
  @IsUUID()
  contactId: string;
} 