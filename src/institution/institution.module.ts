import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/role/schema/role.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AuditLog, AuditLogSchema } from 'src/audit/schemas/audit-log.schema';
import { auditlogService } from 'src/audit/auditlog.service';
import { EmailService } from 'src/email/email.service';
import { Institution, InstitutionSchema } from 'src/institution/schema/institution.schema';
import { AbacModule } from 'src/abac/abac.module';
import { Permission, PermissionSchema } from 'src/role/schema/permission.schema';
import { Plan, PlanSchema } from 'src/plans/schema/plan.schema';
import { InstitutionData, InstitutionDataSchema } from './schema/institutiondata.schema';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Plan.name, schema: PlanSchema },
            { name: Institution.name, schema: InstitutionSchema },
            { name: Permission.name, schema: PermissionSchema },
            { name: InstitutionData.name, schema: InstitutionDataSchema },
        ]),
        AbacModule,
    ],
    controllers: [InstitutionController,],
    providers: [InstitutionService, auditlogService, EmailService],
    exports: [InstitutionService],
})
export class InstitutionModule { }