import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddContactToGroupDto {
  @ApiProperty({ description: 'Contact ID to add to the group' })
  @IsUUID()
  contactId: string;
} 