# Remindr Backend - NestJS Relationship Maintenance App

A production-ready NestJS backend for a A personal relationship and connection management application

## Features

- **Authentication**: JWT-based auth with OTP email verification and password reset
- **User Management**: Profile management and user CRUD operations
- **Admin System**: Role-based admin management with invitation system
- **Contact Groups**: Create, manage, and organize contacts into groups
- **Contacts**: Full CRUD with social profiles and birthday tracking
- **Reminders**: Daily connection suggestions and birthday reminders
- **Notifications**: Multi-channel notification system (Email, In-App, Push)
- **OTP System**: Reusable OTP module for email/phone verification

## Admin System

The admin system provides role-based access control with three user roles:

### User Roles
- **USER**: Regular application users
- **ADMIN**: System administrators with limited privileges
- **SUPER_ADMIN**: Full system administrators with all privileges

### Admin Features
- **Admin Invitation**: Admins can invite new admins via email
- **Role Management**: Super admins can manage admin roles and status
- **Admin Statistics**: View admin counts and activity status
- **Account Activation**: Invited admins complete setup via OTP verification

### Admin API Endpoints
- `POST /admin/invite` - Invite a new admin (ADMIN, SUPER_ADMIN)
- `POST /admin/setup/:email` - Complete admin setup with OTP
- `GET /admin/admins` - Get all admins (ADMIN, SUPER_ADMIN)
- `GET /admin/admins/:id` - Get specific admin (ADMIN, SUPER_ADMIN)
- `PUT /admin/admins/:id/status` - Update admin status (SUPER_ADMIN only)
- `DELETE /admin/admins/:id` - Delete admin (SUPER_ADMIN only)
- `GET /admin/stats` - Get admin statistics (ADMIN, SUPER_ADMIN)
- `POST /admin/resend-invitation` - Resend admin invitation (ADMIN, SUPER_ADMIN)

## OTP System

The OTP (One-Time Password) system provides secure verification for:
- Email verification
- Phone verification
- Password reset
- Admin invitations

### OTP Features
- **Multi-purpose**: Supports different verification purposes
- **Expiration**: Configurable expiration times
- **Rate Limiting**: Prevents spam with attempt limits
- **Auto-cleanup**: Expired OTPs are automatically cleaned up
- **Resend Capability**: Users can request new OTPs

### OTP API Endpoints
- `POST /otp/generate` - Generate OTP code
- `POST /otp/verify` - Verify OTP code
- `POST /otp/resend` - Resend OTP code

### Using OTP for Email Verification

```typescript
// 1. Generate OTP for email verification
await this.otpService.generateOtp({
  identifier: 'user@example.com',
  type: OtpType.EMAIL,
  purpose: OtpPurpose.EMAIL_VERIFICATION,
});

// 2. Verify OTP
await this.otpService.verifyOtp({
  identifier: 'user@example.com',
  code: '123456',
  type: OtpType.EMAIL,
  purpose: OtpPurpose.EMAIL_VERIFICATION,
});
```

## Notification System

The notification system is designed to be:
- **Extensible**: Easy to add new notification types
- **Reliable**: All notifications are logged in the database with status tracking
- **Multi-channel**: Supports Email, In-App, and Push notifications
- **Retry-capable**: Failed notifications can be retried

### Current Notification Types

1. **Email Notifications** (`EMAIL`)
   - Simulated email sending (logs to console)
   - Ready for integration with SendGrid, AWS SES, etc.

2. **In-App Notifications** (`IN_APP`)
   - Stored in database for frontend retrieval
   - Immediate delivery status

3. **Push Notifications** (`PUSH`)
   - Simulated push notification sending
   - Ready for Firebase Cloud Messaging, OneSignal, etc.

### Adding a New Notification Provider

To add a new notification type (e.g., SMS), follow these steps:

1. **Create the Provider**:
```typescript
// src/notification/providers/sms-notification.provider.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from '../interfaces/notification-provider.interface';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class SmsNotificationProvider implements NotificationProvider {
  readonly type = NotificationType.SMS; // Add SMS to the enum first
  private readonly logger = new Logger(SmsNotificationProvider.name);

  async send(
    recipient: string,
    subject: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Implement your SMS sending logic here
      // Use Twilio, AWS SNS, or any other SMS service
      this.logger.log(`[SMS] To: ${recipient} | Message: ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS:`, error.message);
      return false;
    }
  }
}
```

2. **Update the NotificationType enum**:
```typescript
// src/notification/entities/notification.entity.ts
export enum NotificationType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  SMS = 'SMS', // Add this line
}
```

3. **Register the Provider**:
```typescript
// src/notification/notification.module.ts
@Module({
  providers: [
    // ... existing providers
    SmsNotificationProvider,
  ],
})
export class NotificationModule {}
```

4. **Update the NotificationService**:
```typescript
// src/notification/notification.service.ts
constructor(
  // ... existing dependencies
  private readonly smsProvider: SmsNotificationProvider,
) {
  this.providers = new Map<NotificationType, NotificationProvider>([
    // ... existing providers
    [NotificationType.SMS, smsProvider],
  ]);
}
```

### Using the Notification Service

```typescript
// Send a single notification
const notification = await this.notificationService.sendNotification({
  type: NotificationType.EMAIL,
  recipient: 'user@example.com',
  subject: 'Welcome!',
  message: 'Welcome to Remindr!',
  metadata: { template: 'welcome' },
  userId: 'user-id',
});

// Send multiple notifications
const notifications = await this.notificationService.sendMultipleNotifications([
  {
    type: NotificationType.EMAIL,
    recipient: 'user@example.com',
    subject: 'Daily Reminder',
    message: 'Time to connect with your contacts!',
  },
  {
    type: NotificationType.PUSH,
    recipient: 'device-token',
    subject: 'New Message',
    message: 'You have a new message',
  },
]);

// Get user notifications
const userNotifications = await this.notificationService.getUserNotifications(
  'user-id',
  50, // limit
  0,  // offset
);

// Get notification statistics
const stats = await this.notificationService.getNotificationStats('user-id');
// Returns: { total: 100, sent: 85, failed: 10, pending: 5 }

// Retry failed notifications
const retryCount = await this.notificationService.retryFailedNotifications();
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/send-email-verification` - Send email verification OTP
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/send-password-reset` - Send password reset OTP
- `POST /auth/reset-password` - Reset password with OTP

### Admin Management
- `POST /admin/invite` - Invite new admin
- `POST /admin/setup/:email` - Complete admin setup
- `GET /admin/admins` - Get all admins
- `GET /admin/stats` - Get admin statistics

### OTP
- `POST /otp/generate` - Generate OTP
- `POST /otp/verify` - Verify OTP
- `POST /otp/resend` - Resend OTP

### Notifications
- `POST /notifications` - Send a notification
- `POST /notifications/batch` - Send multiple notifications
- `GET /notifications/my` - Get user notifications
- `GET /notifications/stats` - Get notification statistics
- `POST /notifications/retry-failed` - Retry failed notifications

### Reminders
- `GET /reminders/daily-connection` - Get daily connection suggestions
- `GET /reminders` - Get all reminders
- `GET /reminders/:id` - Get specific reminder
- `DELETE /reminders/:id` - Delete reminder

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `DELETE /user/profile` - Delete user account

### Groups
- `POST /groups` - Create group
- `GET /groups` - Get all groups
- `GET /groups/:id` - Get specific group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `POST /groups/:id/contacts` - Add contact to group
- `DELETE /groups/:id/contacts/:contactId` - Remove contact from group

### Contacts
- `POST /contacts` - Create contact
- `GET /contacts` - Get all contacts
- `GET /contacts/:id` - Get specific contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Environment variables**:
Copy `env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=remindr_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

3. **Database setup**:
```bash
# Create database
createdb remindr_db

# Run migrations (or use synchronize: true in development)
npm run typeorm migration:run
```

4. **Start the application**:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Architecture

### Role-Based Access Control
- **RolesGuard**: Protects endpoints based on user roles
- **@Roles() decorator**: Specifies required roles for endpoints
- **Hierarchical permissions**: SUPER_ADMIN > ADMIN > USER

### OTP System
- **Multi-purpose**: Single OTP system for all verification needs
- **Database tracking**: All OTPs logged with status and attempts
- **Auto-cleanup**: Expired OTPs automatically removed
- **Rate limiting**: Prevents abuse with attempt limits

### Notification System
- **Strategy Pattern**: Each notification type has its own provider
- **Database logging**: All notifications tracked with delivery status
- **Retry mechanism**: Failed notifications can be retried
- **Extensible**: Easy to add new notification types

## Database Schema

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `password`: Hashed password
- `firstName`, `lastName`: User names
- `role`: User role (USER, ADMIN, SUPER_ADMIN)
- `isActive`: Account status
- `isEmailVerified`, `isPhoneVerified`: Verification status
- `invitedBy`, `invitedAt`: Admin invitation tracking

### OTP Table
- `id`: UUID primary key
- `identifier`: Email or phone number
- `code`: 6-digit OTP code
- `type`: OTP type (EMAIL, PHONE)
- `purpose`: OTP purpose (EMAIL_VERIFICATION, PASSWORD_RESET, etc.)
- `expiresAt`: Expiration timestamp
- `isUsed`: Whether OTP has been used
- `attempts`: Number of verification attempts
- `maxAttempts`: Maximum allowed attempts

### Notifications Table
- `id`: UUID primary key
- `type`: Notification type (EMAIL, IN_APP, PUSH)
- `status`: Status (PENDING, SENT, FAILED)
- `recipient`: Email, user ID, or device token
- `subject`: Notification subject/title
- `message`: Notification content
- `metadata`: JSON field for additional data
- `errorMessage`: Error message if failed
- `sentAt`: Timestamp when sent
- `userId`: Associated user (optional)
- `createdAt`, `updatedAt`: Timestamps

## Production Considerations

1. **Email Provider**: Replace console logging with SendGrid, AWS SES, or similar
2. **Push Provider**: Integrate with Firebase Cloud Messaging or OneSignal
3. **SMS Provider**: Use Twilio, AWS SNS, or similar
4. **Queue System**: For high volume, consider using Bull/BullMQ for queuing
5. **Monitoring**: Add metrics and monitoring for notification delivery rates
6. **Rate Limiting**: Implement rate limiting for OTP and notification endpoints
7. **Templates**: Add support for notification templates
8. **Preferences**: Allow users to configure notification preferences
9. **Admin Dashboard**: Build admin dashboard for user and system management
10. **Audit Logging**: Log all admin actions for security compliance

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permission control
- **OTP Verification**: Secure multi-factor verification
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive DTO validation
- **Rate Limiting**: OTP attempt limits
- **Admin Invitation**: Secure admin onboarding process 
