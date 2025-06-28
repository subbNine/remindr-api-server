import {
  Controller,
  Get,
  Post,
  Delete,
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
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ReminderService } from "./reminder.service";
import { Contact } from "../contact/entities/contact.entity";
import { Reminder } from "./entities/reminder.entity";
import { User } from "../user/entities/user.entity";

@ApiTags("reminders")
@Controller("reminders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get("daily-connection")
  @ApiOperation({ summary: "Get daily connection suggestions" })
  @ApiResponse({
    status: 200,
    description: "Daily connections retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getDailyConnection(@CurrentUser() user: User): Promise<Contact[]> {
    return this.reminderService.getDailyConnection(user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all reminders for current user" })
  @ApiResponse({ status: 200, description: "Reminders retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@CurrentUser() user: User): Promise<Reminder[]> {
    return this.reminderService.findAll(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific reminder" })
  @ApiParam({ name: "id", description: "Reminder ID" })
  @ApiResponse({ status: 200, description: "Reminder retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reminder not found" })
  async findOne(
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<Reminder> {
    return this.reminderService.findOne(user.id, id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a reminder" })
  @ApiParam({ name: "id", description: "Reminder ID" })
  @ApiResponse({ status: 204, description: "Reminder deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reminder not found" })
  async remove(
    @CurrentUser() user: User,
    @Param("id") id: string
  ): Promise<void> {
    return this.reminderService.remove(user.id, id);
  }
}
