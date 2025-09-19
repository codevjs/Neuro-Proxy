import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';
import bcrypt from 'bcrypt';

import {UserType, userSchema} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';
import {formatZodError} from '@/helpers/handle-zod-error.helper';

@singleton()
export class UserRepository extends BaseRepository {
    private schema = userSchema;

    async getOne(where: Prisma.UserWhereUniqueInput) {
        return await this.prisma.user.findUnique({where});
    }

    async getAll(page: number, limit: number, where?: Prisma.UserWhereInput) {
        const [data, meta] = await this.prisma.user
            .paginate({
                where,
            })
            .withPages({
                page,
                limit,
                includePageCount: true,
            });

        return {
            data,
            meta,
        };
    }

    async create(data: UserType) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(formatZodError(validatedData.error));

        const user = await this.prisma.user.findUnique({
            where: {
                email: validatedData.data.email as string,
            },
        });

        if (user) throw new Error('User already exists, please sign in. if you forgot your password, you can reset it.');

        const hashed = await bcrypt.hash(validatedData.data.password, 10);

        return await this.prisma.user.create({
            data: {
                name: validatedData.data.name,
                email: validatedData.data.email,
                password: hashed,
            },
        });
    }

    async deleteOne(where: Prisma.UserWhereUniqueInput) {
        return await this.prisma.user.delete({where});
    }
}
