import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Otp, OtpType, OtpPurpose } from "./entities/otp.entity";
import { GenerateOtpDto } from "./dto/generate-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../notification/entities/notification.entity";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly notificationService: NotificationService
  ) {}

  async generateOtp(
    generateOtpDto: GenerateOtpDto
  ): Promise<{ message: string }> {
    const {
      identifier,
      type,
      purpose,
      expirationMinutes = 15,
    } = generateOtpDto;

    // Clean up expired OTPs
    await this.cleanupExpiredOtps();

    // Check if there's an active OTP for this identifier and purpose
    const existingOtp = await this.otpRepository.findOne({
      where: {
        identifier,
        type,
        purpose,
        isUsed: false,
      },
      order: { createdAt: "DESC" },
    });

    if (existingOtp && existingOtp.expiresAt > new Date()) {
      const timeLeft = Math.ceil(
        (existingOtp.expiresAt.getTime() - Date.now()) / 60000
      );
      throw new BadRequestException(
        `An OTP was already sent. Please wait ${timeLeft} minutes before requesting a new one.`
      );
    }

    // Generate new OTP
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const otp = this.otpRepository.create({
      identifier,
      code,
      type,
      purpose,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    // Send OTP via notification
    await this.sendOtpNotification(identifier, code, type, purpose);

    this.logger.log(`OTP generated for ${identifier} (${purpose})`);
    return { message: `OTP sent to ${identifier}` };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto
  ): Promise<{ message: string; data?: any }> {
    const { identifier, code, type, purpose } = verifyOtpDto;

    const otp = await this.otpRepository.findOne({
      where: {
        identifier,
        type,
        purpose,
        isUsed: false,
      },
      order: { createdAt: "DESC" },
    });

    if (!otp) {
      throw new NotFoundException("OTP not found or already used");
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException("OTP has expired");
    }

    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException("Maximum verification attempts exceeded");
    }

    // Increment attempts
    otp.attempts += 1;
    await this.otpRepository.save(otp);

    if (otp.code !== code) {
      throw new BadRequestException("Invalid OTP code");
    }

    // Mark OTP as used
    otp.isUsed = true;
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    this.logger.log(`OTP verified for ${identifier} (${purpose})`);

    return {
      message: "OTP verified successfully",
      data: { otpId: otp.id },
    };
  }

  async resendOtp(
    identifier: string,
    type: OtpType,
    purpose: OtpPurpose
  ): Promise<{ message: string }> {
    // Delete existing unused OTPs for this identifier and purpose
    await this.otpRepository.delete({
      identifier,
      type,
      purpose,
      isUsed: false,
    });

    // Generate new OTP
    return this.generateOtp({
      identifier,
      type,
      purpose,
    });
  }

  private generateCode(): string {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpNotification(
    identifier: string,
    code: string,
    type: OtpType,
    purpose: OtpPurpose
  ): Promise<void> {
    const subject = this.getOtpSubject(purpose);
    const message = this.getOtpMessage(code, purpose);

    try {
      if (type === OtpType.EMAIL) {
        await this.notificationService.sendNotification({
          type: NotificationType.EMAIL,
          recipient: identifier,
          subject,
          message,
          metadata: {
            otpCode: code,
            purpose,
            type: "OTP",
          },
        });
      } else if (type === OtpType.PHONE) {
        await this.notificationService.sendNotification({
          type: NotificationType.PUSH, // For SMS, we'd use SMS provider
          recipient: identifier,
          subject,
          message,
          metadata: {
            otpCode: code,
            purpose,
            type: "OTP",
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to send OTP notification to ${identifier}:`,
        error.message
      );
      throw new BadRequestException("Failed to send OTP notification");
    }
  }

  private getOtpSubject(purpose: OtpPurpose): string {
    switch (purpose) {
      case OtpPurpose.EMAIL_VERIFICATION:
        return "Email Verification Code";
      case OtpPurpose.PHONE_VERIFICATION:
        return "Phone Verification Code";
      case OtpPurpose.PASSWORD_RESET:
        return "Password Reset Code";
      case OtpPurpose.ADMIN_INVITATION:
        return "Admin Invitation Code";
      default:
        return "Verification Code";
    }
  }

  private getOtpMessage(code: string, purpose: OtpPurpose): string {
    const baseMessage = `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`;

    switch (purpose) {
      case OtpPurpose.EMAIL_VERIFICATION:
        return `Please verify your email address.\n\n${baseMessage}`;
      case OtpPurpose.PHONE_VERIFICATION:
        return `Please verify your phone number.\n\n${baseMessage}`;
      case OtpPurpose.PASSWORD_RESET:
        return `Please use this code to reset your password.\n\n${baseMessage}`;
      case OtpPurpose.ADMIN_INVITATION:
        return `You have been invited to join as an admin.\n\n${baseMessage}`;
      default:
        return baseMessage;
    }
  }

  private async cleanupExpiredOtps(): Promise<void> {
    const result = await this.otpRepository.delete({
      expiresAt: new Date(),
    });

    if (result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} expired OTPs`);
    }
  }

  async getOtpStats(): Promise<{
    total: number;
    used: number;
    expired: number;
    active: number;
  }> {
    const [total, used, expired, active] = await Promise.all([
      this.otpRepository.count(),
      this.otpRepository.count({ where: { isUsed: true } }),
      this.otpRepository.count({ where: { expiresAt: new Date() } }),
      this.otpRepository.count({
        where: { isUsed: false, expiresAt: new Date() },
      }),
    ]);

    return { total, used, expired, active };
  }
}
