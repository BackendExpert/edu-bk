import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { config } from "process";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/users/schemas/user.schema";
import { Role, RoleSchema } from "src/role/schema/role.schema";
import { Session, SessionSchema } from "./schemas/session.schema";
import { EmailVerification, EmailVerificationSchema } from "./schemas/email-verification.schema";
import { PasswordReset, PasswordResetSchema } from "./schemas/password-reset.schema";
import { Otp, OtpSchema } from "./schemas/otp.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuditLogModule } from "src/audit/auditlog.module";
import { Profile, ProfileSchema } from "src/profile/schema/profile.schema";
import { BackupCode, BackupCodeSchema } from "./schemas/backup-code.schema";
import { EmailService } from "src/email/email.service";
import { JwtStrategy } from "./jwt.strategy";
import { ABACService } from "src/abac/abac.service";
import { Policy, PolicySchema } from "src/abac/schema/policy.schema";
import { Permission, PermissionSchema } from "src/role/schema/permission.schema";
import { OAuth2Client } from "google-auth-library";

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '15m'}
            })
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Session.name, schema: SessionSchema },
            { name: EmailVerification.name, schema: EmailVerificationSchema },
            { name: PasswordReset.name, schema: PasswordResetSchema },
            { name: Otp.name, schema: OtpSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: BackupCode.name, schema: BackupCodeSchema },
            { name: Policy.name, schema: PolicySchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),
        AuditLogModule,
    ],

    controllers: [AuthController],
    providers: [AuthService, EmailService, JwtStrategy, ABACService, OAuth2Client],
    exports: [AuthService]
})

export class AuthModule { }