import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Group } from '../../group/entities/group.entity';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column('jsonb', { nullable: true })
  socialProfiles: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.contacts)
  user: User;

  @Column()
  userId: string;

  @ManyToMany(() => Group, (group) => group.contacts)
  groups: Group[];
} 