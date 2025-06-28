import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../user/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { OtpService } from "../otp/otp.service";
import { OtpType, OtpPurpose } from "../otp/entities/otp.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException("Email already registered");

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: false, // Will be verified via OTP
    });

    const savedUser = await this.userRepository.save(user);

    // Send email verification OTP
    await this.otpService.generateOtp({
      identifier: registerDto.email,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (!user.isActive) {
      throw new UnauthorizedException(
        "Account is deactivated. Please contact support."
      );
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async sendEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    await this.otpService.generateOtp({
      identifier: email,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    return { message: "Email verification OTP sent" };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto
  ): Promise<{ message: string }> {
    const { email, code } = verifyEmailDto;

    // Verify OTP
    await this.otpService.verifyOtp({
      identifier: email,
      code,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
    });

    // Mark email as verified
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.isEmailVerified = true;
    await this.userRepository.save(user);

    return { message: "Email verified successfully" };
  }

  async sendPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.otpService.generateOtp({
      identifier: email,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.PASSWORD_RESET,
    });

    return { message: "Password reset OTP sent" };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    // Verify OTP first
    await this.otpService.verifyOtp({
      identifier: email,
      code: resetPasswordDto.otpCode, // We'll need to add this to the DTO
      type: OtpType.EMAIL,
      purpose: OtpPurpose.PASSWORD_RESET,
    });

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: "Password reset successfully" };
  }
}
