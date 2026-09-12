import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from './schema/policy.schema';
import { ABACService } from './abac.service';
import { Role, RoleSchema } from 'src/role/schema/role.schema';
import { Permission, PermissionSchema } from 'src/role/schema/permission.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Policy.name, schema: PolicySchema, },
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema }
        ]),
    ],
    providers: [ABACService],
    exports: [ABACService],
})
export class AbacModule { }