import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClientInfo } from "../interfaces/client-info.interface";

export const ClientInfoDecorator = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): ClientInfo => {
        const request = ctx.switchToHttp().getRequest();

        const forwarded = request.headers['x-forwarded-for'];

        const ipAddress = forwarded
            ? forwarded.split(',')[0].trim()
            : request.socket?.remoteAddress || '';

        return {
            ipAddress,
            userAgent: request.headers['user-agent'] || '',
            deviceId: request.headers['x-device-id'] || '',
        };
    },
);