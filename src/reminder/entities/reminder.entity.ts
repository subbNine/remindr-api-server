import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ReminderType } from '../../common/enums/reminder-type.enum';
import { User } from '../../user/entities/user.entity';
import { Contact } from '../../contact/entities/contact.entity';

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReminderType })
  type: ReminderType;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  notified: boolean;

  @ManyToOne(() => User, (user) => user.reminders)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Contact, (contact) => contact.id)
  contact: Contact;

  @Column()
  contactId: string;
} 