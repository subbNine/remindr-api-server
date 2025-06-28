import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { NotificationService } from "./notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Notification } from "./entities/notification.entity";
import { User } from "../user/entities/user.entity";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: "Send a notification" })
  @ApiResponse({ status: 201, description: "Notification sent successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async sendNotification(
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    return this.notificationService.sendNotification(createNotificationDto);
  }

  @Post("batch")
  @ApiOperation({ summary: "Send multiple notifications" })
  @ApiResponse({ status: 201, description: "Notifications sent successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async sendMultipleNotifications(
    @Body() notifications: CreateNotificationDto[]
  ): Promise<Notification[]> {
    return this.notificationService.sendMultipleNotifications(notifications);
  }

  @Get("my")
  @ApiOperation({ summary: "Get current user notifications" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of notifications to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of notifications to skip",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserNotifications(
    @CurrentUser() user: User,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(
      user.id,
      limit,
      offset
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get notification statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getNotificationStats(@CurrentUser() user: User) {
    return this.notificationService.getNotificationStats(user.id);
  }

  @Post("retry-failed")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retry failed notifications" })
  @ApiResponse({ status: 200, description: "Retry completed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async retryFailedNotifications(): Promise<{ retryCount: number }> {
    const retryCount =
      await this.notificationService.retryFailedNotifications();
    return { retryCount };
  }
}
