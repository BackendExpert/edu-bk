import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Role, RoleSchema } from 'src/role/schema/role.schema';
import { Permission, PermissionSchema } from 'src/role/schema/permission.schema';
import { Policy, PolicySchema, } from 'src/abac/schema/policy.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Profile, ProfileSchema } from 'src/profile/schema/profile.schema';
import { AuditLog, AuditLogSchema } from 'src/audit/schemas/audit-log.schema';
import { auditlogService } from 'src/audit/auditlog.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema, },
            { name: Permission.name, schema: PermissionSchema, },
            { name: Policy.name, schema: PolicySchema, },
            { name: User.name, schema: UserSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService, auditlogService ],
    exports: [AdminService],
})
export class AdminModule { }