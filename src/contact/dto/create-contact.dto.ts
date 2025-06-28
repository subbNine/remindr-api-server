import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateContactDto {
  @ApiProperty({ description: "Contact name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Contact phone number" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: "Contact birthday" })
  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @ApiPropertyOptional({ description: "Contact profile photo URL" })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({ description: "Social media profiles" })
  @IsOptional()
  socialProfiles?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
}
