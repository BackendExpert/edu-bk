import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/role/schema/role.schema';
import { Permission, PermissionSchema } from 'src/role/schema/permission.schema';
import { Policy, PolicySchema, } from 'src/abac/schema/policy.schema';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AuditLog, AuditLogSchema } from 'src/audit/schemas/audit-log.schema';
import { auditlogService } from 'src/audit/auditlog.service';
import { EmailService } from 'src/email/email.service';
import { Profile, ProfileSchema } from './schema/profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Profile.name, schema: ProfileSchema }
        ]),
    ],
    controllers: [ProfileController,],
    providers: [ProfileService, auditlogService, EmailService ],
    exports: [ProfileService],
})
export class ProfileModule { }