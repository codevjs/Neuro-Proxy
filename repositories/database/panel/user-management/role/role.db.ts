import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';

import {RolePermissionType, roleSchema, RoleType} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class RoleRepository extends BaseRepository {
    private schema = roleSchema;

    async getOne(where: Prisma.RoleWhereUniqueInput) {
        return await this.prisma.role.findUnique({
            where,
        });
    }

    async getAll(
        page: number,
        limit: number,
        where?: Prisma.RoleWhereInput,
        orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[]
    ) {
        const [data, meta] = await this.prisma.role
            .paginate({
                where,
                orderBy,
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

    async create(data: RoleType) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.role.create({
            data: {
                name: validatedData.data.name,
                description: validatedData.data.description,
                permission: validatedData.data.permission,
            },
        });
    }

    async update(where: Prisma.RoleWhereUniqueInput, data: RoleType) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.role.update({
            where,
            data: {
                name: validatedData.data.name,
                description: validatedData.data.description,
            },
        });
    }

    async updatePermission(where: Prisma.RoleWhereUniqueInput, data: RolePermissionType[]) {
        return await this.prisma.role.update({
            where,
            data: {
                permission: data,
            },
        });
    }

    async delete(where: Prisma.RoleWhereUniqueInput) {
        return await this.prisma.role.delete({where});
    }
}
