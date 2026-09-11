import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Policy, PolicySchema } from './schema/policy.schema';
import { ABACService } from './abac.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Policy.name, schema: PolicySchema, },
        ]),
    ],
    providers: [ABACService],
    exports: [ABACService],
})
export class AbacModule { }