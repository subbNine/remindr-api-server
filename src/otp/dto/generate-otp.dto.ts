import { IsEnum, IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OtpType, OtpPurpose } from "../entities/otp.entity";

export class GenerateOtpDto {
  @ApiProperty({ description: "Email or phone number" })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ enum: OtpType, description: "Type of OTP (EMAIL or PHONE)" })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ enum: OtpPurpose, description: "Purpose of the OTP" })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @ApiPropertyOptional({ description: "Custom expiration time in minutes" })
  @IsOptional()
  expirationMinutes?: number;
}
