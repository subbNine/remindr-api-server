import { NotificationType } from "../entities/notification.entity";

export interface NotificationProvider {
  readonly type: NotificationType;
  send(
    recipient: string,
    subject: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean>;
}

export interface NotificationResult {
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}
