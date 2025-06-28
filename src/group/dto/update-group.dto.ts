import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({ description: 'Name of the group' })
  @IsString()
  @IsNotEmpty()
  name: string;
} 