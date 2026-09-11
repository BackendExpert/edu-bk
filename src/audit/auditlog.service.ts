import { Injectable } from "@nestjs/common";
import {
    AuditLog,
    AuditLogDocument,
    AuditAction,
    AuditResult,
    AuditSeverity,
} from './schemas/audit-log.schema';
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

export interface CreateAuditLogInput {
    userId?: string | Types.ObjectId | null;
    targetUserId?: string | Types.ObjectId | null;
    action: AuditAction;
    resource: string;
    resourceId?: string | null;
    result: AuditResult;
    severity?: AuditSeverity;
    reason?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    sessionId?: string | null;
    requestId?: string | null;
    endpoint?: string | null;
    httpMethod?: string | null;
    policyId?: string | null;
    policyVersion?: string | null;
    abacDecision?: string | null;
    metadata?: Record<string, unknown> | null;
}

@Injectable()
export class auditlogService {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLogDocument>,
    ) { }

    async create(data: CreateAuditLogInput) {
        return this.auditLogModel.create({
            userId: this.toObjectId(data.userId),
            targetUserId: this.toObjectId(data.targetUserId),
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId ?? null,
            result: data.result,
            severity: data.severity ?? AuditSeverity.MEDIUM,
            reason: data.reason ?? null,
            ipAddress: data.ipAddress ?? null,
            userAgent: data.userAgent ?? null,
            sessionId: data.sessionId ?? null,
            requestId: data.requestId ?? null,
            endpoint: data.endpoint ?? null,
            httpMethod: data.httpMethod ?? null,
            policyId: data.policyId ?? null,
            policyVersion: data.policyVersion ?? null,
            abacDecision: data.abacDecision ?? null,
            metadata: data.metadata ?? null,
        });
    }

    async findByResource(resource: string, resourceId?: string, limit = 100,) {
        const filter: Record<string, unknown> = {
            resource,
        };

        if (resourceId) {
            filter.resourceId = resourceId;
        }

        return this.auditLogModel
            .find(filter)
            .sort({
                createdAt: -1,
            })
            .limit(limit)
            .lean();
    }

    async findSecurityEvents(limit = 100) {
        return this.auditLogModel
            .find({
                severity: {
                    $in: [
                        AuditSeverity.HIGH,
                        AuditSeverity.CRITICAL,
                    ],
                },
            })
            .sort({
                createdAt: -1,
            })
            .limit(limit)
            .lean();
    }

    async findAccessDeniedEvents(limit = 100) {
        return this.auditLogModel
            .find({
                result: AuditResult.DENIED,
            })
            .sort({
                createdAt: -1,
            })
            .limit(limit)
            .lean();
    }


    private toObjectId(value?: string | Types.ObjectId | null): Types.ObjectId | null {
        if (!value) {
            return null;
        }

        if (value instanceof Types.ObjectId) {
            return value;
        }

        if (!Types.ObjectId.isValid(value)) {
            return null;
        }

        return new Types.ObjectId(value);
    }
} 