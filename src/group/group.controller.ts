import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddContactToGroupDto } from './dto/add-contact-to-group.dto';
import { Group } from './entities/group.entity';
import { User } from '../user/entities/user.entity';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: User,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return this.groupService.create(user.id, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups for current user' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: User): Promise<Group[]> {
    return this.groupService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string): Promise<Group> {
    return this.groupService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.update(user.id, id, updateGroupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 204, description: 'Group deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async remove(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    return this.groupService.remove(user.id, id);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add a contact to a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Contact added to group successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group or contact not found' })
  @ApiResponse({ status: 409, description: 'Contact already in group' })
  async addContactToGroup(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() addContactDto: AddContactToGroupDto,
  ): Promise<Group> {
    return this.groupService.addContactToGroup(user.id, id, addContactDto);
  }

  @Delete(':id/contacts/:contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a contact from a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'contactId', description: 'Contact ID' })
  @ApiResponse({ status: 204, description: 'Contact removed from group successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group or contact not found' })
  async removeContactFromGroup(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ): Promise<void> {
    await this.groupService.removeContactFromGroup(user.id, id, contactId);
  }
} 