import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/role/schema/role.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AuditLog, AuditLogSchema } from 'src/audit/schemas/audit-log.schema';
import { auditlogService } from 'src/audit/auditlog.service';
import { EmailService } from 'src/email/email.service';
import { Plan, PlanSchema } from './schema/plan.schema';
import { Institution, InstitutionSchema } from 'src/institution/schema/institution.schema';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { AbacModule } from 'src/abac/abac.module';
import { Permission, PermissionSchema } from 'src/role/schema/permission.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Plan.name, schema: PlanSchema },
            { name: Institution.name, schema: InstitutionSchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),
        AbacModule,
    ],
    controllers: [PlanController,],
    providers: [PlanService, auditlogService, EmailService ],
    exports: [PlanService],
})
export class PlanModule { }