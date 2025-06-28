import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderType } from '../common/enums/reminder-type.enum';
import { Group } from '../group/entities/group.entity';
import { Contact } from '../contact/entities/contact.entity';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(userId: string, createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      ...createReminderDto,
      userId,
    });
    return this.reminderRepository.save(reminder);
  }

  async findAll(userId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { userId },
      relations: ['contact'],
      order: { date: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id, userId },
      relations: ['contact'],
    });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }
    return reminder;
  }

  async remove(userId: string, id: string): Promise<void> {
    const reminder = await this.findOne(userId, id);
    await this.reminderRepository.remove(reminder);
  }

  async getDailyConnection(userId: string): Promise<Contact[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have daily connections for today
    const existingReminders = await this.reminderRepository.find({
      where: {
        userId,
        type: ReminderType.DAILY_CONNECTION,
        date: today,
      },
      relations: ['contact'],
    });

    if (existingReminders.length > 0) {
      return existingReminders.map((reminder) => reminder.contact);
    }

    // Get all groups for the user
    const groups = await this.groupRepository.find({
      where: { userId },
      relations: ['contacts'],
    });

    const dailyConnections: Contact[] = [];

    // For each group, select a random contact
    for (const group of groups) {
      if (group.contacts && group.contacts.length > 0) {
        const randomIndex = Math.floor(Math.random() * group.contacts.length);
        const selectedContact = group.contacts[randomIndex];

        // Create a reminder for this daily connection
        await this.create(userId, {
          type: ReminderType.DAILY_CONNECTION,
          date: today,
          contactId: selectedContact.id,
        });

        dailyConnections.push(selectedContact);
      }
    }

    return dailyConnections;
  }

  async generateBirthdayReminders(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find contacts with birthdays today
    const contactsWithBirthdays = await this.contactRepository
      .createQueryBuilder('contact')
      .where('EXTRACT(MONTH FROM contact.birthday) = :month', { month: today.getMonth() + 1 })
      .andWhere('EXTRACT(DAY FROM contact.birthday) = :day', { day: today.getDate() })
      .andWhere('contact.birthday IS NOT NULL')
      .getMany();

    // Create birthday reminders for each contact
    for (const contact of contactsWithBirthdays) {
      const existingReminder = await this.reminderRepository.findOne({
        where: {
          userId: contact.userId,
          contactId: contact.id,
          type: ReminderType.BIRTHDAY,
          date: today,
        },
      });

      if (!existingReminder) {
        await this.create(contact.userId, {
          type: ReminderType.BIRTHDAY,
          date: today,
          contactId: contact.id,
        });
      }
    }
  }

  async markAsNotified(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({ where: { id } });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    reminder.notified = true;
    return this.reminderRepository.save(reminder);
  }
} 