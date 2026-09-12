import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Role, RoleDocument } from "src/role/schema/role.schema";
import { AccountStatus, User, UserDocument } from "src/users/schemas/user.schema";
import { Session, SessionDocument } from "./schemas/session.schema";
import { EmailVerification, EmailVerificationDocument } from "./schemas/email-verification.schema";
import { PasswordReset, PasswordResetDocument } from "./schemas/password-reset.schema";
import { Otp, OtpDocument } from "./schemas/otp.schema";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { RegisterDto } from "./dto/register.dto";
import { EmailService } from "src/email/email.service";
import { auditlogService } from "src/audit/auditlog.service";
import { OAuth2Client } from "google-auth-library";

import {
    AuditAction,
    AuditResult,
    AuditSeverity,
} from "src/audit/schemas/audit-log.schema";
import { LoginDto } from "./dto/login.dto";
import { Profile, ProfileDocument } from "src/profile/schema/profile.schema";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { BackupCode, BackupCodeDocument } from "./schemas/backup-code.schema";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { UserInstitution, UserInstitutionDocument } from "./schemas/user-institute.schema";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,

        @InjectModel(Session.name)
        private readonly sessionModel: Model<SessionDocument>,

        @InjectModel(EmailVerification.name)
        private readonly emailverificationModel: Model<EmailVerificationDocument>,

        @InjectModel(PasswordReset.name)
        private readonly passwordresetModel: Model<PasswordResetDocument>,

        @InjectModel(Profile.name)
        private readonly profileModel: Model<ProfileDocument>,

        @InjectModel(UserInstitution.name)
        private readonly userinstitutionModel: Model<UserInstitutionDocument>,


        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly emailService: EmailService,
        private readonly auditlogService: auditlogService,
        private readonly googleClient: OAuth2Client,
    ) { }



    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12)
    }

    private async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    private genarteToken(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    private hashtoken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex')
    }

    private generateBackupCode(): string {
        return crypto.randomBytes(5).toString('hex').toUpperCase();
    }

    private requiresInstitution(role: string): boolean {
        return !["SUPER_ADMIN", "GUEST", "INSTITUTE_ADMIN", "SYSTEM_STAFF"].includes(role);
    }

    async Registation(
        dto: RegisterDto,
        ipAddress: string,
        userAgent: string,
    ) {
        const email = dto.email.toLocaleLowerCase().trim()

        const existingUser = await this.userModel.findOne({ email: email })

        if (existingUser) {
            throw new ConflictException("Unable to create account")
        }

        const role = await this.roleModel.findOne({ name: "GUEST", isActive: true })

        if (!role) {
            throw new BadRequestException("Default role is not configured")
        }

        const passwordhash = await this.hashPassword(dto.password)

        const user = await this.userModel.create({
            email: email,
            passwordHash: passwordhash,
            roleId: role._id,
            accountStatus: AccountStatus.PENDING,
            emailVerified: false
        })

        const create_profile = await this.profileModel.create({
            userId: user._id
        })

        const token = this.genarteToken();

        await this.emailverificationModel.create({
            userId: user._id,
            tokenHash: this.hashtoken(token),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        })

        const name = user.email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

        await this.emailService.sendVerificationEmail(
            user.email,
            name,
            token,
        );

        await this.auditlogService.create({
            userId: user._id,
            action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
            resource: "AUTH",
            resourceId: user._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "Email verification message sent successfully",
            metadata: {
                email: user.email,
                emailType: "verification",
            },
        });

        return {
            success: true,
            message: 'Registration successful. Please verify your email.',
        };
    }

    async GoogleLogin(
        dto: GoogleLoginDto,
        deviceId: string,
        ipAddress: string,
        userAgent: string
    ) {

        const ticket = await this.googleClient.verifyIdToken({
            idToken: dto.credential,
            audience: this.config.get<string>("GOOGLE_CLIENT_ID"),
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new BadRequestException("Invalid Google credential");
        }

        if (!payload.sub) {
            throw new BadRequestException("Google account ID not found");
        }

        if (!payload.email) {
            throw new BadRequestException("Google account email not found");
        }

        if (!payload.email_verified) {
            throw new BadRequestException("Google email is not verified");
        }

        const googleId = payload.sub;
        const email = payload.email.toLowerCase().trim();

        let user = await this.userModel.findOne({
            googleId,
        });

        if (!user) {

            user = await this.userModel.findOne({
                email,
            });

            if (user) {

                if (!user.emailVerified) {
                    throw new BadRequestException(
                        "Please verify your email before using Google login"
                    );
                }

                user.googleId = googleId;
                user.authProvider = "GOOGLE";

                await user.save();

            } else {

                const guestRole = await this.roleModel.findOne({
                    name: "GUEST",
                });

                if (!guestRole) {
                    throw new NotFoundException("Default role not found");
                }

                user = await this.userModel.create({
                    email,
                    googleId,
                    authProvider: "GOOGLE",
                    roleId: guestRole._id,
                    accountStatus: AccountStatus.ACTIVE,
                    emailVerified: true,
                });

                await this.profileModel.create({
                    userId: user._id,
                });
            }
        }

        if (user.accountStatus === AccountStatus.SUSPENDED) {
            throw new BadRequestException("Account is suspended");
        }

        if (user.accountStatus === AccountStatus.DISABLED) {
            throw new BadRequestException("Account is disabled");
        }

        const sessionId = new Types.ObjectId().toString();

        const rolename = await this.roleModel.findById(user.roleId);

        if (!rolename) {
            throw new NotFoundException("Role Cannot be Found");
        }

        let institutionId: Types.ObjectId | null = null;

        if (this.requiresInstitution(rolename.name)) {
            const institutions = await this.userinstitutionModel.find({
                userId: user._id,
                status: "ACTIVE",
            }).populate("institutionId");

            if (institutions.length === 0) {
                throw new BadRequestException("No active institution is assigned to this account");
            }

            if (dto.institutionId) {
                const selectedInstitution = institutions.find(
                    (item) => item.institutionId.toString() === dto.institutionId
                );

                if (!selectedInstitution) {
                    throw new BadRequestException("You do not have access to this institution");
                }

                institutionId = selectedInstitution.institutionId as Types.ObjectId;
            } else if (institutions.length === 1) {
                institutionId = institutions[0].institutionId as Types.ObjectId;
            } else {
                return {
                    success: true,
                    requiresInstitutionSelection: true,
                    institutions: institutions.map((item) => item.institutionId),
                };
            }
        }

        const refreshToken = this.genarteToken();

        const refreshTokenHash = this.hashtoken(refreshToken);

        await this.sessionModel.create({
            _id: sessionId,
            userId: user._id,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ipAddress,
            userAgent,
            deviceId,
            isActive: true,
            lastUsedAt: new Date(),
        });

        const role = await this.roleModel.findById(user.roleId);

        const userData = {
            id: user._id,
            email: user.email,
            roleId: user.roleId,
            role: rolename.name,
            institutionId,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
        };

        const accessToken = await this.jwtService.signAsync({
            sub: user._id.toString(),
            sessionId,
            user: userData,
        });

        await this.auditlogService.create({
            userId: user._id,
            action: AuditAction.LOGIN,
            resource: "AUTH",
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            ipAddress,
            userAgent,
            sessionId,
            metadata: {
                authProvider: "GOOGLE",
            },
        });

        return {
            accessToken,
            refreshToken,
            user: userData,
        };
    }

    async VerifyEmail(
        token: string,
        ipAddress: string,
        userAgent: string,
    ) {
        const hashtoken = this.hashtoken(token)

        const verification = await this.emailverificationModel.findOne({ tokenHash: hashtoken })

        if (!verification) {
            await this.auditlogService.create({
                action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
                resource: "AUTH",
                result: AuditResult.DENIED,
                severity: AuditSeverity.MEDIUM,
                reason: "Invalid email verification token",
                ipAddress,
                userAgent,
            });

            throw new BadRequestException(
                "Invalid or expired verification token",
            );
        }

        if (verification.expiresAt <= new Date()) {
            await this.auditlogService.create({
                userId: verification.userId,
                action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
                resource: "AUTH",
                resourceId: verification.userId.toString(),
                result: AuditResult.DENIED,
                severity: AuditSeverity.MEDIUM,
                reason: "Email verification token has expired",
                ipAddress,
                userAgent,
            });

            await this.emailverificationModel.deleteOne({
                _id: verification._id,
            });

            throw new BadRequestException(
                "Verification token has expired",
            );
        }

        const user = await this.userModel.findById(
            verification.userId,
        );

        if (!user) {
            await this.auditlogService.create({
                action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
                resource: "AUTH",
                result: AuditResult.DENIED,
                severity: AuditSeverity.HIGH,
                reason: "User associated with verification token was not found",
                ipAddress,
                userAgent,
            });

            throw new BadRequestException(
                "Unable to verify email",
            );
        }

        if (user.emailVerified) {
            await this.emailverificationModel.deleteOne({
                _id: verification._id,
            });

            throw new BadRequestException(
                "Email is already verified",
            );
        }

        user.emailVerified = true;
        user.accountStatus = AccountStatus.ACTIVE;

        await user.save();

        await this.emailverificationModel.deleteOne({
            _id: verification._id,
        });


        await this.auditlogService.create({
            userId: user._id,
            action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
            resource: "AUTH",
            resourceId: user._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "Email address verified successfully",
            ipAddress,
            userAgent,
            metadata: {
                email: user.email,
                emailType: "verification",
            },
        });

        return {
            success: true,
            message: "Email verified successfully",
        };
    }

    async Login(
        dto: LoginDto,
        deviceId: string,
        ipAddress: string,
        userAgent: string,
    ) {
        const normalizedEmail = dto.email.toLowerCase().trim()

        const user = await this.userModel.findOne({
            email: normalizedEmail
        }).select('+passwordHash')

        if (!user) {
            await this.auditlogService.create({
                action: AuditAction.LOGIN_FAILED,
                resource: "AUTH",
                result: AuditResult.FAILED,
                severity: AuditSeverity.MEDIUM,
                reason: "Invalid email or password",
                ipAddress,
                userAgent,
                metadata: {
                    email: normalizedEmail,
                },
            });

            throw new BadRequestException("Invalid email or password");
        }

        if (!user.emailVerified) {
            await this.auditlogService.create({
                userId: user._id,
                action: AuditAction.LOGIN_FAILED,
                resource: "AUTH",
                resourceId: user._id.toString(),
                result: AuditResult.DENIED,
                severity: AuditSeverity.MEDIUM,
                reason: "Email address is not verified",
                ipAddress,
                userAgent,
            });

            throw new BadRequestException("Please verify your email address first");
        }

        if (
            user.accountStatus === AccountStatus.SUSPENDED ||
            user.accountStatus === AccountStatus.DISABLED ||
            user.accountStatus === AccountStatus.LOCKED
        ) {
            await this.auditlogService.create({
                userId: user._id,
                action: AuditAction.LOGIN_FAILED,
                resource: "AUTH",
                resourceId: user._id.toString(),
                result: AuditResult.DENIED,
                severity: AuditSeverity.HIGH,
                reason: `Account status: ${user.accountStatus}`,
                ipAddress,
                userAgent,
            });

            throw new BadRequestException("Account is not available for login");
        }

        if (!user.passwordHash) {
            throw new BadRequestException("This account does not have a password. Please login with Google");
        }

        const passwordVaild = await this.comparePassword(dto.password, user.passwordHash);

        if (!passwordVaild) {
            const failedAttempts = user.failedLoginAttempts + 1;

            const maxAttempts = 5;

            if (failedAttempts >= maxAttempts) {
                user.failedLoginAttempts = 0;

                user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

                user.accountStatus = AccountStatus.LOCKED;

                await user.save();

                await this.auditlogService.create({
                    userId: user._id,
                    action: AuditAction.ACCOUNT_LOCKED,
                    resource: "AUTH",
                    resourceId: user._id.toString(),
                    result: AuditResult.DENIED,
                    severity: AuditSeverity.HIGH,
                    reason: "Maximum failed login attempts reached",
                    ipAddress,
                    userAgent,
                    metadata: {
                        failedAttempts,
                        lockDurationMinutes: 15,
                    },
                });

                throw new BadRequestException("Too many failed login attempts. Account temporarily locked.");
            }

            user.failedLoginAttempts = failedAttempts;

            await user.save();

            await this.auditlogService.create({
                userId: user._id,
                action: AuditAction.LOGIN_FAILED,
                resource: "AUTH",
                resourceId: user._id.toString(),
                result: AuditResult.FAILED,
                severity:
                    failedAttempts >= 3
                        ? AuditSeverity.HIGH
                        : AuditSeverity.MEDIUM,
                reason: "Invalid password",
                ipAddress,
                userAgent,
                metadata: {
                    failedAttempts,
                },
            });

            throw new BadRequestException("Invalid email or password");
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.accountStatus = AccountStatus.ACTIVE;
        user.lastLoginAt = new Date();
        user.lastLoginIp = ipAddress;

        await user.save();

        const sessionId = new Types.ObjectId().toString();

        const rolename = await this.roleModel.findById(user.roleId);

        if (!rolename) {
            throw new NotFoundException("Role Cannot be Found");
        }
        let institutionId: Types.ObjectId | null = null;

        if (this.requiresInstitution(rolename.name)) {
            const institutions = await this.userinstitutionModel.find({
                userId: user._id,
                status: "ACTIVE",
            }).populate("institutionId");

            if (institutions.length === 0) {
                throw new BadRequestException("No active institution is assigned to this account");
            }

            if (dto.institutionId) {
                const selectedInstitution = institutions.find(
                    (item) => item.institutionId.toString() === dto.institutionId
                );

                if (!selectedInstitution) {
                    throw new BadRequestException("You do not have access to this institution");
                }

                institutionId = selectedInstitution.institutionId as Types.ObjectId;
            } else if (institutions.length === 1) {
                institutionId = institutions[0].institutionId as Types.ObjectId;
            } else {
                return {
                    success: true,
                    requiresInstitutionSelection: true,
                    institutions: institutions.map((item) => item.institutionId),
                };
            }
        }

        const refreshToken = this.genarteToken();

        const refreshTokenHash = this.hashtoken(refreshToken);

        await this.sessionModel.create({
            _id: sessionId,
            userId: user._id,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            revokedAt: null,
            ipAddress,
            userAgent,
            deviceId: deviceId ?? null,
            isActive: true,
            lastUsedAt: new Date(),
        });

        const userData = {
            id: user._id,
            email: user.email,
            roleId: user.roleId,
            role: rolename.name,
            institutionId,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
        };

        const accessToken = await this.jwtService.signAsync({
            sub: user._id.toString(),
            sessionId,
            user: userData,
        });

        await this.auditlogService.create({
            userId: user._id,
            action: AuditAction.LOGIN,
            resource: "AUTH",
            resourceId: user._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "User logged in successfully",
            ipAddress,
            userAgent,
            sessionId,
            metadata: {
                deviceId: deviceId ?? null,
            },
        });
        const name = user.email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

        await this.emailService.sendWelcomeEmail(
            dto.email,
            name
        )

        return {
            success: true,
            message: "Login Successful",
            accessToken,
            refreshToken
        };
    }

    async refreshToken(refresh_Token: string, institutionId?: string) {
        const refreshTokenHash = this.hashtoken(refresh_Token);

        const session = await this.sessionModel.findOne({
            refreshTokenHash: refreshTokenHash,
            isActive: true,
            revokedAt: null,
            expiresAt: {
                $gt: new Date(),
            },
        });

        if (!session) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        const user = await this.userModel.findById(session.userId);

        if (!user) {
            await this.sessionModel.updateOne(
                { _id: session._id },
                {
                    $set: {
                        isActive: false,
                        revokedAt: new Date(),
                    },
                }
            );

            throw new BadRequestException("Invalid or expired refresh token");
        }

        if (
            user.accountStatus === AccountStatus.SUSPENDED ||
            user.accountStatus === AccountStatus.DISABLED ||
            user.accountStatus === AccountStatus.LOCKED
        ) {
            await this.sessionModel.updateOne(
                { _id: session._id },
                {
                    $set: {
                        isActive: false,
                        revokedAt: new Date(),
                    },
                }
            );

            throw new BadRequestException("Account is not available");
        }

        const rolename = await this.roleModel.findById(user.roleId);

        if (!rolename) {
            throw new NotFoundException("Role Cannot be Found");
        }

        let selectedInstitutionId: Types.ObjectId | null = null;

        if (this.requiresInstitution(rolename.name)) {
            const institutions = await this.userinstitutionModel.find({
                userId: user._id,
                status: "ACTIVE",
            }).populate("institutionId");

            if (institutions.length === 0) {
                throw new BadRequestException("No active institution is assigned to this account");
            }

            if (!institutionId) {
                throw new BadRequestException("Institution selection is required");
            }

            const selectedInstitution = institutions.find(
                (item) => item.institutionId.toString() === institutionId
            );

            if (!selectedInstitution) {
                throw new BadRequestException("You do not have access to this institution");
            }

            selectedInstitutionId = selectedInstitution.institutionId as Types.ObjectId;
        }

        const newRefreshToken = this.genarteToken();
        const newRefreshTokenHash = this.hashtoken(
            newRefreshToken
        );

        session.refreshTokenHash = newRefreshTokenHash;
        session.lastUsedAt = new Date();

        await session.save();

        const userData = {
            id: user._id,
            email: user.email,
            roleId: user.roleId,
            role: rolename.name,
            institutionId: selectedInstitutionId,
            accountStatus: user.accountStatus,
            emailVerified: user.emailVerified,
        };

        const accessToken = await this.jwtService.signAsync({
            sub: user._id.toString(),
            sessionId: session._id.toString(),
            user: userData,
        });

        return {
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(
        token: string
    ) {
        const refreshTokenHash = this.hashtoken(token);

        const session = await this.sessionModel.findOne({
            refreshTokenHash,
            isActive: true,
            revokedAt: null,
        });

        if (!session) {
            throw new BadRequestException("Invalid session");
        }

        session.isActive = false;
        session.revokedAt = new Date();

        await session.save();

        await this.auditlogService.create({
            userId: session.userId,
            action: AuditAction.LOGOUT,
            resource: "AUTH",
            resourceId: session.userId.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "User logged out successfully",
            sessionId: session._id.toString(),
        });

        return {
            success: true,
            message: "Logged out successfully",
        };
    }

    async forgetPassword(
        dto: ForgotPasswordDto,
        ipAddress: string,
        userAgent: string,
    ) {
        const useremail = dto.email.toLowerCase().trim()

        const targetUser = await this.userModel.findOne({
            email: useremail,

        })

        if (!targetUser) {
            throw new NotFoundException("User cannot be found")
        }

        const passresetToken = this.genarteToken();
        const hashpassresetToken = this.hashtoken(passresetToken)

        await this.passwordresetModel.deleteMany({
            userId: targetUser._id,
            usedAt: null,
        });

        await this.passwordresetModel.create({
            userId: targetUser._id,
            tokenHash: hashpassresetToken,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            usedAt: null,
        });

        const name = targetUser.email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

        await this.emailService.sendPasswordResetEmail(
            targetUser.email,
            name,
            passresetToken,
        );

        await this.auditlogService.create({
            userId: targetUser._id,
            action: AuditAction.PASSWORD_RESET_REQUESTED,
            resource: "AUTH",
            resourceId: targetUser._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.LOW,
            reason: "Password reset email sent successfully",
            ipAddress,
            userAgent,
            metadata: {
                email: targetUser.email,
                emailType: "password_reset",
            },
        });

        return {
            success: true,
            message: "Password reset email sent successfully",
        };
    }


    async resetPassword(
        token: string,
        dto: ResetPasswordDto,
        ipAddress: string,
        userAgent: string,
    ) {
        const tokenHash = this.hashtoken(token);

        const passwordReset = await this.passwordresetModel.findOne({
            tokenHash,
            usedAt: null,
            expiresAt: {
                $gt: new Date(),
            },
        });

        if (!passwordReset) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        const user = await this.userModel
            .findById(passwordReset.userId)
            .select("+passwordHash");

        if (!user) {
            throw new NotFoundException("User cannot be found");
        }

        const passwordHash = await this.hashPassword(
            dto.password,
        );

        user.passwordHash = passwordHash;
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.accountStatus = AccountStatus.ACTIVE;

        await user.save();

        passwordReset.usedAt = new Date();

        await passwordReset.save();

        await this.sessionModel.updateMany(
            {
                userId: user._id,
                isActive: true,
                revokedAt: null,
            },
            {
                $set: {
                    isActive: false,
                    revokedAt: new Date(),
                },
            },
        );


        await this.auditlogService.create({
            userId: user._id,
            action: AuditAction.PASSWORD_RESET_COMPLETED,
            resource: "AUTH",
            resourceId: user._id.toString(),
            result: AuditResult.SUCCESS,
            severity: AuditSeverity.MEDIUM,
            reason: "Password reset completed successfully",
            ipAddress,
            userAgent,
            metadata: {
                passwordReset: true,
            },
        });

        return {
            success: true,
            message: "Password reset successfully",
        };
    }
}