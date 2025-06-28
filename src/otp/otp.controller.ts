import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { OtpService } from "./otp.service";
import { GenerateOtpDto } from "./dto/generate-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { OtpType, OtpPurpose } from "./entities/otp.entity";

@ApiTags("otp")
@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate OTP code" })
  @ApiResponse({
    status: 201,
    description: "OTP generated and sent successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request or OTP already sent" })
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.otpService.generateOtp(generateOtpDto);
  }

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify OTP code" })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  @ApiResponse({ status: 404, description: "OTP not found" })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }

  @Post("resend")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend OTP code" })
  @ApiResponse({ status: 200, description: "OTP resent successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async resendOtp(
    @Body("identifier") identifier: string,
    @Body("type") type: OtpType,
    @Body("purpose") purpose: OtpPurpose
  ) {
    return this.otpService.resendOtp(identifier, type, purpose);
  }
}
