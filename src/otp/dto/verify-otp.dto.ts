import { IsEnum, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OtpType, OtpPurpose } from "../entities/otp.entity";

export class VerifyOtpDto {
  @ApiProperty({ description: "Email or phone number" })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: "OTP code" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: OtpType, description: "Type of OTP (EMAIL or PHONE)" })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ enum: OtpPurpose, description: "Purpose of the OTP" })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
