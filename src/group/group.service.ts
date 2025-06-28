import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddContactToGroupDto } from './dto/add-contact-to-group.dto';
import { User } from '../user/entities/user.entity';
import { Contact } from '../contact/entities/contact.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(userId: string, createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create({
      ...createGroupDto,
      userId,
    });
    return this.groupRepository.save(group);
  }

  async findAll(userId: string): Promise<Group[]> {
    return this.groupRepository.find({
      where: { userId },
      relations: ['contacts'],
    });
  }

  async findOne(userId: string, id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id, userId },
      relations: ['contacts'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(userId: string, id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(userId, id);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(userId: string, id: string): Promise<void> {
    const group = await this.findOne(userId, id);
    await this.groupRepository.remove(group);
  }

  async addContactToGroup(
    userId: string,
    groupId: string,
    addContactDto: AddContactToGroupDto,
  ): Promise<Group> {
    const group = await this.findOne(userId, groupId);
    const contact = await this.contactRepository.findOne({
      where: { id: addContactDto.contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (!group.contacts) {
      group.contacts = [];
    }

    // Check if contact is already in the group
    const contactExists = group.contacts.some((c) => c.id === contact.id);
    if (contactExists) {
      throw new ForbiddenException('Contact is already in this group');
    }

    group.contacts.push(contact);
    return this.groupRepository.save(group);
  }

  async removeContactFromGroup(
    userId: string,
    groupId: string,
    contactId: string,
  ): Promise<Group> {
    const group = await this.findOne(userId, groupId);
    
    if (!group.contacts) {
      throw new NotFoundException('No contacts in this group');
    }

    group.contacts = group.contacts.filter((contact) => contact.id !== contactId);
    return this.groupRepository.save(group);
  }
} 