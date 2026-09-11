import { SetMetadata } from '@nestjs/common';

export const ABAC_PERMISSION_KEY = 'abac_permission';

export const AbacPermission = (permission: string) => SetMetadata(ABAC_PERMISSION_KEY, permission);