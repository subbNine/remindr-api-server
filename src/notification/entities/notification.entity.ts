import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum NotificationType {
  EMAIL = "EMAIL",
  IN_APP = "IN_APP",
  PUSH = "PUSH",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column()
  recipient: string; // email, user ID, or device token

  @Column()
  subject: string;

  @Column("text")
  message: string;

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;
}
