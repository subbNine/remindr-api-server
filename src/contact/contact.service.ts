import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(userId: string, createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      userId,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(userId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { userId },
      relations: ['groups'],
    });
  }

  async findOne(userId: string, id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, userId },
      relations: ['groups'],
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(userId: string, id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(userId, id);
    Object.assign(contact, updateContactDto);
    return this.contactRepository.save(contact);
  }

  async remove(userId: string, id: string): Promise<void> {
    const contact = await this.findOne(userId, id);
    await this.contactRepository.remove(contact);
  }

  async findContactsWithBirthdayToday(): Promise<Contact[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    return this.contactRepository
      .createQueryBuilder('contact')
      .where('EXTRACT(MONTH FROM contact.birthday) = :month', { month })
      .andWhere('EXTRACT(DAY FROM contact.birthday) = :day', { day })
      .andWhere('contact.birthday IS NOT NULL')
      .getMany();
  }
} 