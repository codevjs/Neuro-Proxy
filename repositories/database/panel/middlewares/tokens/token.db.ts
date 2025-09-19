import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';

import {tokenSchema} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class TokenRepository extends BaseRepository {
    private schema = tokenSchema;

    async create(data: Prisma.TokenCreateInput) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.token.create({
            data: {
                name: validatedData?.data?.name,
                token: validatedData?.data?.token,
            },
        });
    }

    async getAll(where?: Prisma.TokenWhereInput, orderBy?: Prisma.TokenOrderByWithRelationInput | Prisma.TokenOrderByWithRelationInput[]) {
        return await this.prisma.token.findMany({
            where,
            orderBy,
        });
    }

    async delete(where: Prisma.TokenWhereUniqueInput) {
        return await this.prisma.token.delete({
            where,
        });
    }
}
