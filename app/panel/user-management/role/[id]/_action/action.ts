'use server';

import {Prisma} from '@prisma/client';
import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {checkAbility} from '@/libs/casl-ability.lib';
import {RolePermissionType} from '@/repositories/database/panel/user-management/role/schema.zod';
import {RoleRepository} from '@/repositories/database/panel/user-management/role/role.db';
import {PermissionRepository} from '@/repositories/database/panel/user-management/permission/permission.db';

const roleRepository = container.resolve(RoleRepository);
const permissionRepository = container.resolve(PermissionRepository);

export const getOneRoleAction = async (where: Prisma.RoleWhereUniqueInput) => {
    try {
        await checkAbility('read', 'Role');

        const data = await roleRepository.getOne(where);

        return {success: true, data: data};
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

export const getAllPermissionAction = async () => {
    try {
        await checkAbility('read', 'Permission');

        const data = await permissionRepository.getAllByGroup();

        return {
            success: true,
            data: data,
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

export const updateRolePermissionAction = async (id: string, data: RolePermissionType[]) => {
    try {
        await checkAbility('update', 'Role', data);

        await roleRepository.updatePermission({id}, data);

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
