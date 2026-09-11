import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    AuditLog,
    AuditLogSchema,
} from './schemas/audit-log.schema';
import { auditlogService } from './auditlog.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AuditLog.name, schema: AuditLogSchema, },
        ]),
    ],
    providers: [auditlogService,],
    exports: [auditlogService,],
})
export class AuditLogModule { }