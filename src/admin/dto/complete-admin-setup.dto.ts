import { IsString, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CompleteAdminSetupDto {
  @ApiProperty({ description: "OTP code received via email" })
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @ApiProperty({ description: "New password for the admin account" })
  @IsString()
  @MinLength(6)
  password: string;
}
