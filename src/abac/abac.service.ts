import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Policy,
    PolicyDocument,
    PolicyCondition,
    PolicyEffect,
    PolicyOperator,
} from './schema/policy.schema'

@Injectable()
export class ABACService {
    constructor(
        @InjectModel(Policy.name)
        private readonly policyModel: Model<PolicyDocument>,
    ) { }

    async can(
        subject: Record<string, unknown>,
        resource: Record<string, unknown>,
        action: string,
        permissionId: string,
        environment: Record<string, unknown> = {},
    ): Promise<boolean> {
        if (!Types.ObjectId.isValid(permissionId)) {
            console.log('ABAC ERROR: Invalid permissionId:', permissionId);
            return false;
        }

        const policies = await this.policyModel
            .find({
                permissionId: new Types.ObjectId(permissionId),
                isActive: true,
            })
            .sort({
                version: -1,
            });

        console.log('ABAC CHECK:', {
            permissionId,
            action,
            subject,
            resource,
            environment,
            policyCount: policies.length,
        });

        if (policies.length === 0) {
            console.log('ABAC ERROR: No active policy found for permission:', permissionId);
            return false;
        }

        let allowed = false;

        for (const policy of policies) {
            const matched = this.evaluatePolicy(
                policy.conditions,
                subject,
                resource,
                action,
                environment,
            );

            console.log('ABAC POLICY:', {
                policyId: policy._id.toString(),
                policyName: policy.name,
                effect: policy.effect,
                version: policy.version,
                conditions: policy.conditions,
                matched,
            });

            if (!matched) {
                continue;
            }

            if (policy.effect === PolicyEffect.DENY) {
                console.log('ABAC DENIED: Matching DENY policy:', policy.name);
                return false;
            }

            if (policy.effect === PolicyEffect.ALLOW) {
                console.log('ABAC ALLOWED: Matching ALLOW policy:', policy.name);
                allowed = true;
            }
        }

        console.log('ABAC FINAL RESULT:', allowed);

        return allowed;
    }

    private evaluatePolicy(
        conditions: PolicyCondition[],
        subject: Record<string, unknown>,
        resource: Record<string, unknown>,
        action: string,
        environment: Record<string, unknown>,
    ): boolean {
        const roleConditions = conditions.filter(
            (condition) =>
                condition.attribute === 'subject.role' &&
                condition.operator === PolicyOperator.EQUALS,
        );

        const otherConditions = conditions.filter(
            (condition) =>
                !(
                    condition.attribute === 'subject.role' &&
                    condition.operator === PolicyOperator.EQUALS
                ),
        );

        const roleMatched =
            roleConditions.length === 0 ||
            roleConditions.some((condition) => {
                const actualValue = this.resolveAttribute(
                    condition.attribute,
                    subject,
                    resource,
                    action,
                    environment,
                );

                const expectedValue = this.resolveValue(
                    condition.value,
                    subject,
                    resource,
                    action,
                    environment,
                );

                return this.evaluateCondition(
                    actualValue,
                    condition.operator,
                    expectedValue,
                );
            });

        const otherConditionsMatched = otherConditions.every((condition) => {
            const actualValue = this.resolveAttribute(
                condition.attribute,
                subject,
                resource,
                action,
                environment,
            );

            const expectedValue = this.resolveValue(
                condition.value,
                subject,
                resource,
                action,
                environment,
            );

            return this.evaluateCondition(
                actualValue,
                condition.operator,
                expectedValue,
            );
        });

        return roleMatched && otherConditionsMatched;
    }

    private evaluateCondition(
        actualValue: unknown,
        operator: PolicyOperator,
        expectedValue: unknown,
    ): boolean {
        switch (operator) {
            case PolicyOperator.EQUALS:
                return this.equals(
                    actualValue,
                    expectedValue,
                );

            case PolicyOperator.NOT_EQUALS:
                return !this.equals(
                    actualValue,
                    expectedValue,
                );

            case PolicyOperator.IN:
                return Array.isArray(expectedValue)
                    ? expectedValue.some((value) =>
                        this.equals(actualValue, value),
                    )
                    : false;

            case PolicyOperator.NOT_IN:
                return Array.isArray(expectedValue)
                    ? !expectedValue.some((value) =>
                        this.equals(actualValue, value),
                    )
                    : false;

            case PolicyOperator.EXISTS:
                return actualValue !== undefined &&
                    actualValue !== null;

            case PolicyOperator.NOT_EXISTS:
                return actualValue === undefined ||
                    actualValue === null;

            case PolicyOperator.CONTAINS:
                return typeof actualValue === 'string' &&
                    typeof expectedValue === 'string'
                    ? actualValue.includes(expectedValue)
                    : Array.isArray(actualValue)
                        ? actualValue.some((value) =>
                            this.equals(
                                value,
                                expectedValue,
                            ),
                        )
                        : false;

            case PolicyOperator.STARTS_WITH:
                return typeof actualValue === 'string' &&
                    typeof expectedValue === 'string'
                    ? actualValue.startsWith(expectedValue)
                    : false;

            case PolicyOperator.ENDS_WITH:
                return typeof actualValue === 'string' &&
                    typeof expectedValue === 'string'
                    ? actualValue.endsWith(expectedValue)
                    : false;

            case PolicyOperator.GREATER_THAN:
                return this.compare(
                    actualValue,
                    expectedValue,
                ) > 0;

            case PolicyOperator.GREATER_THAN_OR_EQUAL:
                return this.compare(
                    actualValue,
                    expectedValue,
                ) >= 0;

            case PolicyOperator.LESS_THAN:
                return this.compare(
                    actualValue,
                    expectedValue,
                ) < 0;

            case PolicyOperator.LESS_THAN_OR_EQUAL:
                return this.compare(
                    actualValue,
                    expectedValue,
                ) <= 0;

            default:
                return false;
        }
    }

    private resolveAttribute(
        attribute: string,
        subject: Record<string, unknown>,
        resource: Record<string, unknown>,
        action: string,
        environment: Record<string, unknown>,
    ): unknown {
        if (attribute === 'action') {
            return action;
        }

        if (attribute.startsWith('subject.')) {
            return this.getNestedValue(
                subject,
                attribute.substring(8),
            );
        }

        if (attribute.startsWith('resource.')) {
            return this.getNestedValue(
                resource,
                attribute.substring(9),
            );
        }

        if (attribute.startsWith('environment.')) {
            return this.getNestedValue(
                environment,
                attribute.substring(12),
            );
        }

        return undefined;
    }

    private resolveValue(
        value: unknown,
        subject: Record<string, unknown>,
        resource: Record<string, unknown>,
        action: string,
        environment: Record<string, unknown>,
    ): unknown {
        if (
            typeof value === 'string' &&
            value.startsWith('subject.')
        ) {
            return this.resolveAttribute(
                value,
                subject,
                resource,
                action,
                environment,
            );
        }

        if (
            typeof value === 'string' &&
            value.startsWith('resource.')
        ) {
            return this.resolveAttribute(
                value,
                subject,
                resource,
                action,
                environment,
            );
        }

        if (
            typeof value === 'string' &&
            value.startsWith('environment.')
        ) {
            return this.resolveAttribute(
                value,
                subject,
                resource,
                action,
                environment,
            );
        }

        return value;
    }

    private getNestedValue(
        object: Record<string, unknown>,
        path: string,
    ): unknown {
        return path.split('.').reduce<unknown>((value, key) => {
            if (
                typeof value !== 'object' ||
                value === null
            ) {
                return undefined;
            }

            return (value as Record<string, unknown>)[key];
        }, object);
    }

    private equals(
        first: unknown,
        second: unknown,
    ): boolean {
        if (
            first instanceof Types.ObjectId &&
            second instanceof Types.ObjectId
        ) {
            return first.toString() === second.toString();
        }

        if (
            first instanceof Types.ObjectId &&
            typeof second === 'string'
        ) {
            return first.toString() === second;
        }

        if (
            second instanceof Types.ObjectId &&
            typeof first === 'string'
        ) {
            return first === second.toString();
        }

        if (
            typeof first === 'object' &&
            first !== null &&
            typeof second === 'object' &&
            second !== null
        ) {
            return JSON.stringify(first) ===
                JSON.stringify(second);
        }

        return first === second;
    }

    private compare(
        first: unknown,
        second: unknown,
    ): number {
        const firstNumber = this.toComparableNumber(first);
        const secondNumber = this.toComparableNumber(second);

        if (
            firstNumber === null ||
            secondNumber === null
        ) {
            return 0;
        }

        if (firstNumber > secondNumber) {
            return 1;
        }

        if (firstNumber < secondNumber) {
            return -1;
        }

        return 0;
    }

    private toComparableNumber(
        value: unknown,
    ): number | null {
        if (value instanceof Date) {
            return value.getTime();
        }

        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const number = Number(value);

            if (!Number.isNaN(number)) {
                return number;
            }

            const date = new Date(value);

            if (!Number.isNaN(date.getTime())) {
                return date.getTime();
            }
        }

        return null;
    }
}