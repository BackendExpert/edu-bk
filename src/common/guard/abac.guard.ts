import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ABAC_PERMISSION_KEY } from '../decorators/abac.decorator';
import { ABACService } from 'src/abac/abac.service';
import {
    Permission,
    PermissionDocument,
} from 'src/role/schema/permission.schema';
import {
    Role,
    RoleDocument,
} from 'src/role/schema/role.schema';

@Injectable()
export class AbacGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly abacService: ABACService,

        @InjectModel(Permission.name)
        private readonly permissionModel: Model<PermissionDocument>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<RoleDocument>,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const permissionName =
            this.reflector.getAllAndOverride<string>(
                ABAC_PERMISSION_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        if (!permissionName) {
            return true;
        }

        const request =
            context.switchToHttp().getRequest();

        const user = request.user;

        if (!user) {
            throw new ForbiddenException(
                'Authentication required',
            );
        }

        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        const permission =
            await this.permissionModel.findOne({
                name: permissionName,
                isActive: true,
            });

        if (!permission) {
            throw new ForbiddenException(
                'Permission not configured',
            );
        }

        const roleHasPermission =
            await this.roleModel.exists({
                _id: user.roleId,
                permissions: permission._id,
                isActive: true,
            });

        if (!roleHasPermission) {
            throw new ForbiddenException(
                'Permission denied',
            );
        }

        const now = new Date();

        const sriLankaTime = new Date(
            now.toLocaleString('en-US', {
                timeZone: 'Asia/Colombo',
            }),
        );

        const allowed = await this.abacService.can(
            {
                userId: user.userId,
                roleId: user.roleId,
                role: user.role,
            },
            {},
            permission.action,
            permission._id.toString(),
            {
                dayOfWeek: sriLankaTime.getDay(),
                hour: sriLankaTime.getHours(),
                minute: sriLankaTime.getMinutes(),
            },
        );

        if (!allowed) {
            throw new ForbiddenException(
                'Access denied by policy',
            );
        }

        return true;
    }
}