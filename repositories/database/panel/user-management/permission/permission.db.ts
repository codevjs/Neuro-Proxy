import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';

import {permissionSchema, PermissionType} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';
import {GroupedPermission} from '@/types';

@singleton()
export class PermissionRepository extends BaseRepository {
    private schema = permissionSchema;

    async getOne(where: Prisma.PermissionWhereUniqueInput) {
        return await this.prisma.permission.findUnique({
            where,
        });
    }

    async getAll(
        page: number,
        limit: number,
        where?: Prisma.PermissionWhereInput,
        orderBy?: Prisma.PermissionOrderByWithRelationInput | Prisma.PermissionOrderByWithRelationInput[]
    ) {
        const [data, meta] = await this.prisma.permission
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

    async getAllByGroup() {
        const permissions = [
            // {
            //     id: 'cm623y9cr000070to2a4ns8y7',
            //     group: 'USER MANAGEMENT',
            //     name: 'PERMISSION',
            //     description: null,
            //     subject: 'Permission',
            //     actions: ['create', 'read', 'update', 'delete'],
            //     fields: null,
            //     conditions: null,
            //     inverted: null,
            //     reason: null,
            //     created_at: '2025-01-18 11:31:13.754',
            //     updated_at: '2025-01-18 11:31:13.754',
            // },
            {
                id: 'cm623ykgd000170topvjxihuu',
                group: 'USER MANAGEMENT',
                name: 'ROLE',
                description: null,
                subject: 'Role',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-18 11:31:28.142',
                updated_at: '2025-01-18 11:31:28.142',
            },
            {
                id: 'cm623zxm5000270tojbrkd1h1',
                group: 'USER MANAGEMENT',
                name: 'USER',
                description: null,
                subject: 'User',
                actions: ['create', 'read', 'delete', 'update'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-18 11:32:31.853',
                updated_at: '2025-01-18 11:32:31.853',
            },
            {
                id: 'cm68wxtpv0000197nqijtf58i',
                group: 'TRAEFIK',
                name: 'ACCESS LOG',
                description: null,
                subject: 'AccessLog',
                actions: ['read'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:49:19.411',
                updated_at: '2025-01-23 05:49:19.411',
            },
            {
                id: 'cm68wyfnr0001197ng2nees04',
                group: 'TRAEFIK',
                name: 'SERVICE',
                description: null,
                subject: 'Service',
                actions: ['read'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:49:47.848',
                updated_at: '2025-01-23 05:49:47.848',
            },
            {
                id: 'cm68wz1gf0002197nv67yewq5',
                group: 'TRAEFIK',
                name: 'BASIC AUTH',
                description: null,
                subject: 'BasicAuth',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:50:16.095',
                updated_at: '2025-01-23 05:50:16.095',
            },
            {
                id: 'cm68wzji90003197notzls3xq',
                group: 'TRAEFIK',
                name: 'TOKEN & WHITELIST IP',
                description: null,
                subject: 'Token',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:50:39.489',
                updated_at: '2025-01-23 06:08:43.450',
            },
            {
                id: 'cm68wzzs50004197nrapkatr5',
                group: 'TRAEFIK',
                name: 'STRIP PREFIX',
                description: null,
                subject: 'StripPrefix',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:51:00.582',
                updated_at: '2025-01-23 05:51:00.582',
            },
            {
                id: 'cm68x0ueu0005197n64qekbhe',
                group: 'TRAEFIK',
                name: 'IP WHITELIST',
                description: null,
                subject: 'IPWhitelist',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:51:40.278',
                updated_at: '2025-01-23 05:51:40.278',
            },
            {
                id: 'cm68x1du80006197nk4ic6xsk',
                group: 'TRAEFIK',
                name: 'ROUTER',
                description: null,
                subject: 'Router',
                actions: ['create', 'read', 'update', 'delete'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 05:52:05.457',
                updated_at: '2025-01-23 05:52:05.457',
            },
            {
                id: 'cm68y3rhv0008197n6myyif2n',
                group: 'TRAEFIK',
                name: 'MIDDLEWARE',
                description: null,
                subject: 'Middleware',
                actions: ['read'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-01-23 06:21:56.084',
                updated_at: '2025-01-23 06:21:56.084',
            },
            {
                id: 'cm6t3200p0000db83o7rdovdw',
                group: 'DOCKER',
                name: 'CONTAINER',
                description: null,
                subject: 'Container',
                actions: ['read', 'update'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-02-06 08:35:55.416',
                updated_at: '2025-02-06 08:35:55.416',
            },
            {
                id: 'cm6tzp00p0000u6sovdu7rnms',
                group: 'SBU',
                name: 'INVOICE',
                description: null,
                subject: 'Invoice',
                actions: ['read'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-02-06 08:35:55.416',
                updated_at: '2025-02-06 08:35:55.416',
            },
            {
                id: 'cm6tzp00p0000qy00dcpl0iy4',
                group: 'COMPANY',
                name: 'COMPANY',
                description: null,
                subject: 'Company',
                actions: ['read'],
                fields: null,
                conditions: null,
                inverted: null,
                reason: null,
                created_at: '2025-07-06 08:35:55.416',
                updated_at: '2025-07-06 08:35:55.416',
            },
        ];

        const groupedPermissions = permissions.reduce(
            (acc, permission) => {
                if (!acc[permission.group]) {
                    acc[permission.group] = {
                        group: permission.group,
                        permissions: [],
                    };
                }

                acc[permission.group].permissions.push(permission);

                return acc;
            },
            {} as Record<string, GroupedPermission>
        );

        return Object.values(groupedPermissions);
    }

    async create(data: PermissionType) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.permission.create({
            data: {
                name: validatedData.data.name,
                description: validatedData.data.description,
                group: validatedData.data.group,
                subject: validatedData.data.subject,
                actions: validatedData.data.actions,
                fields: validatedData.data.fields,
                conditions: validatedData.data.conditions,
                inverted: validatedData.data.inverted,
                reason: validatedData.data.reason,
            },
        });
    }

    async update(where: Prisma.PermissionWhereUniqueInput, data: PermissionType) {
        const validatedData = this.schema.safeParse(data);

        if (!validatedData.success) throw new Error(validatedData.error.message);

        return await this.prisma.permission.update({where, data: validatedData.data});
    }

    async delete(where: Prisma.PermissionWhereUniqueInput) {
        return await this.prisma.permission.delete({where});
    }
}
