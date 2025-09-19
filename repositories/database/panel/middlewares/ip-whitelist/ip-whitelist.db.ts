import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';

import {ipWhitelistSchema} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class IPWhitelistRepository extends BaseRepository {
    private schema = ipWhitelistSchema;

    async create(data: Prisma.IPWhitelistCreateInput) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.iPWhitelist.create({
            data: {
                name: validatedData?.data?.name,
                ip: validatedData?.data?.ip,
            },
        });
    }

    async getAll(
        where?: Prisma.IPWhitelistWhereInput,
        orderBy?: Prisma.IPWhitelistOrderByWithRelationInput | Prisma.IPWhitelistOrderByWithRelationInput[]
    ) {
        return await this.prisma.iPWhitelist.findMany({
            where,
            orderBy,
        });
    }

    async delete(where: Prisma.IPWhitelistWhereUniqueInput) {
        return await this.prisma.iPWhitelist.delete({
            where,
        });
    }
}
