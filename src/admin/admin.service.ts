import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../user/entities/user.entity";
import { UserRole } from "../common/enums/user-role.enum";
import { InviteAdminDto } from "./dto/invite-admin.dto";
import { CompleteAdminSetupDto } from "./dto/complete-admin-setup.dto";
import { OtpService } from "../otp/otp.service";
import { OtpType, OtpPurpose } from "../otp/entities/otp.entity";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpService: OtpService
  ) {}

  async inviteAdmin(
    inviterId: string,
    inviteAdminDto: InviteAdminDto
  ): Promise<{ message: string }> {
    const { email, firstName, lastName, role } = inviteAdminDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Check if inviter has permission to invite this role
    const inviter = await this.userRepository.findOne({
      where: { id: inviterId },
    });
    if (!inviter || inviter.role === UserRole.USER) {
      throw new BadRequestException(
        "Insufficient permissions to invite admins"
      );
    }

    if (
      role === UserRole.SUPER_ADMIN &&
      inviter.role !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException(
        "Only super admins can invite super admins"
      );
    }

    // Create inactive admin user
    const adminUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      role,
      isActive: false,
      invitedBy: inviterId,
      invitedAt: new Date(),
      password: "", // Will be set during setup
    });

    await this.userRepository.save(adminUser);

    // Send OTP for admin invitation
    await this.otpService.generateOtp({
      identifier: email,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.ADMIN_INVITATION,
      expirationMinutes: 60, // 1 hour for admin invitations
    });

    this.logger.log(`Admin invitation sent to ${email} by ${inviter.email}`);
    return { message: `Admin invitation sent to ${email}` };
  }

  async completeAdminSetup(
    email: string,
    completeAdminSetupDto: CompleteAdminSetupDto
  ): Promise<{ message: string }> {
    const { otpCode, password } = completeAdminSetupDto;

    // Find the invited admin
    const adminUser = await this.userRepository.findOne({ where: { email } });
    if (!adminUser) {
      throw new NotFoundException("Admin invitation not found");
    }

    if (adminUser.isActive) {
      throw new BadRequestException("Admin account is already active");
    }

    // Verify OTP
    await this.otpService.verifyOtp({
      identifier: email,
      code: otpCode,
      type: OtpType.EMAIL,
      purpose: OtpPurpose.ADMIN_INVITATION,
    });

    // Hash password and activate account
    const hashedPassword = await bcrypt.hash(password, 10);
    adminUser.password = hashedPassword;
    adminUser.isActive = true;
    adminUser.isEmailVerified = true;

    await this.userRepository.save(adminUser);

    this.logger.log(`Admin account activated for ${email}`);
    return { message: "Admin account setup completed successfully" };
  }

  async getAllAdmins(): Promise<User[]> {
    return this.userRepository.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
      order: { createdAt: "DESC" },
    });
  }

  async getAdminById(id: string): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { id, role: UserRole.ADMIN },
    });

    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    return admin;
  }

  async updateAdminStatus(id: string, isActive: boolean): Promise<User> {
    const admin = await this.getAdminById(id);
    admin.isActive = isActive;
    return this.userRepository.save(admin);
  }

  async deleteAdmin(id: string): Promise<void> {
    const admin = await this.getAdminById(id);
    await this.userRepository.remove(admin);
  }

  async getAdminStats(): Promise<{
    totalAdmins: number;
    activeAdmins: number;
    inactiveAdmins: number;
    superAdmins: number;
  }> {
    const [totalAdmins, activeAdmins, inactiveAdmins, superAdmins] =
      await Promise.all([
        this.userRepository.count({
          where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
        }),
        this.userRepository.count({
          where: [
            { role: UserRole.ADMIN, isActive: true },
            { role: UserRole.SUPER_ADMIN, isActive: true },
          ],
        }),
        this.userRepository.count({
          where: [
            { role: UserRole.ADMIN, isActive: false },
            { role: UserRole.SUPER_ADMIN, isActive: false },
          ],
        }),
        this.userRepository.count({
          where: { role: UserRole.SUPER_ADMIN },
        }),
      ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      superAdmins,
    };
  }

  async resendAdminInvitation(email: string): Promise<{ message: string }> {
    const adminUser = await this.userRepository.findOne({ where: { email } });
    if (!adminUser) {
      throw new NotFoundException("Admin invitation not found");
    }

    if (adminUser.isActive) {
      throw new BadRequestException("Admin account is already active");
    }

    // Resend OTP
    await this.otpService.resendOtp(
      email,
      OtpType.EMAIL,
      OtpPurpose.ADMIN_INVITATION
    );

    return { message: `Admin invitation resent to ${email}` };
  }
}
