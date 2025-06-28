import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum OtpType {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
}

export enum OtpPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  ADMIN_INVITATION = "ADMIN_INVITATION",
}

@Entity()
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  identifier: string; // email or phone number

  @Column()
  code: string;

  @Column({ type: "enum", enum: OtpType })
  type: OtpType;

  @Column({ type: "enum", enum: OtpPurpose })
  purpose: OtpPurpose;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  usedAt: Date;

  @Column({ default: 0 })
  attempts: number; // Number of verification attempts

  @Column({ default: 3 })
  maxAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
