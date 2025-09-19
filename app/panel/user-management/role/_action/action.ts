'use server';

import {Prisma} from '@prisma/client';
import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {RoleType} from '@/repositories/database/panel/user-management/role/schema.zod';
import {RoleRepository} from '@/repositories/database/panel/user-management/role/role.db';

const roleRepository = container.resolve(RoleRepository);

export const getAllRoleAction = async (
    page: number,
    limit: number,
    where?: Prisma.RoleWhereInput,
    orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[]
) => {
    try {
        await checkAbility('read', 'Role');

        const result = await roleRepository.getAll(page, limit, where, orderBy);

        return {
            success: true,
            data: {
                data: result.data,
                meta: result.meta,
            },
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Something went wrong',
        };
    }
};

export const createRoleAction = async (data: RoleType) => {
    try {
        await checkAbility('create', 'Role');

        await roleRepository.create(data);

        return {
            success: true,
            message: 'Role created successfully',
        };
    } catch (error) {
        console.error(error);

        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to create role',
        };
    }
};

export const updateRoleAction = async (id: string, data: RoleType) => {
    try {
        await checkAbility('update', 'Role', data);

        await roleRepository.update({id}, data);

        return {
            success: true,
            message: 'Role updated successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to update role',
        };
    }
};

export const deleteRoleAction = async (id: string) => {
    try {
        await checkAbility('delete', 'Role');

        await roleRepository.delete({id});

        return {
            success: true,
            message: 'Role deleted successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to delete role',
        };
    }
};
