import { IsEmail, IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../common/enums/user-role.enum";

export class InviteAdminDto {
  @ApiProperty({ description: "Email address of the admin to invite" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "First name of the admin" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "Last name of the admin" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    description: "Role to assign (ADMIN or SUPER_ADMIN)",
  })
  @IsEnum(UserRole)
  role: UserRole;
}
