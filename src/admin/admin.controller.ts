import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import { InviteAdminDto } from "./dto/invite-admin.dto";
import { CompleteAdminSetupDto } from "./dto/complete-admin-setup.dto";
import { User } from "../user/entities/user.entity";
import { UserRole } from "../common/enums/user-role.enum";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("invite")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Invite a new admin" })
  @ApiResponse({
    status: 201,
    description: "Admin invitation sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request or insufficient permissions",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 409, description: "User already exists" })
  async inviteAdmin(
    @CurrentUser() user: User,
    @Body() inviteAdminDto: InviteAdminDto
  ) {
    return this.adminService.inviteAdmin(user.id, inviteAdminDto);
  }

  @Post("setup/:email")
  @ApiOperation({ summary: "Complete admin setup after invitation" })
  @ApiResponse({
    status: 200,
    description: "Admin setup completed successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request or invalid OTP" })
  @ApiResponse({ status: 404, description: "Admin invitation not found" })
  async completeAdminSetup(
    @Param("email") email: string,
    @Body() completeAdminSetupDto: CompleteAdminSetupDto
  ) {
    return this.adminService.completeAdminSetup(email, completeAdminSetupDto);
  }

  @Get("admins")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all admins" })
  @ApiResponse({ status: 200, description: "Admins retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get("admins/:id")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get admin by ID" })
  @ApiParam({ name: "id", description: "Admin ID" })
  @ApiResponse({ status: 200, description: "Admin retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 404, description: "Admin not found" })
  async getAdminById(@Param("id") id: string) {
    return this.adminService.getAdminById(id);
  }

  @Patch("admins/:id/status")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update admin status (activate/deactivate)" })
  @ApiParam({ name: "id", description: "Admin ID" })
  @ApiResponse({
    status: 200,
    description: "Admin status updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - only super admins can update status",
  })
  @ApiResponse({ status: 404, description: "Admin not found" })
  async updateAdminStatus(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean
  ) {
    return this.adminService.updateAdminStatus(id, isActive);
  }

  @Delete("admins/:id")
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete admin" })
  @ApiParam({ name: "id", description: "Admin ID" })
  @ApiResponse({ status: 204, description: "Admin deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - only super admins can delete admins",
  })
  @ApiResponse({ status: 404, description: "Admin not found" })
  async deleteAdmin(@Param("id") id: string) {
    return this.adminService.deleteAdmin(id);
  }

  @Get("stats")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get admin statistics" })
  @ApiResponse({
    status: 200,
    description: "Admin statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Post("resend-invitation")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Resend admin invitation" })
  @ApiResponse({
    status: 200,
    description: "Admin invitation resent successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 404, description: "Admin invitation not found" })
  async resendAdminInvitation(@Body("email") email: string) {
    return this.adminService.resendAdminInvitation(email);
  }
}
