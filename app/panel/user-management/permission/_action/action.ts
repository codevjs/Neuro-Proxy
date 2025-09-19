'use server';

import {Prisma} from '@prisma/client';
import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {PermissionRepository} from '@/repositories/database/panel/user-management/permission/permission.db';
import {checkAbility} from '@/libs/casl-ability.lib';
import {SubjectRepository} from '@/repositories/database/panel/user-management/subject/subject.db';
import {PermissionType} from '@/repositories/database/panel/user-management/permission/schema.zod';

const permissionRepository = container.resolve(PermissionRepository);
const subjectRepository = container.resolve(SubjectRepository);

export const getAllSubjectAction = async () => {
    try {
        await checkAbility('read', 'Permission');

        const result = await subjectRepository.getAll();

        return {
            success: true,
            message: 'Subject fetched successfully',
            data: result,
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
                data: [],
            };

        return {
            success: false,
            message: 'Something went wrong',
            data: [],
        };
    }
};

export const getAllPermissionAction = async (
    page: number,
    limit: number,
    where?: Prisma.PermissionWhereInput,
    orderBy?: Prisma.PermissionOrderByWithRelationInput | Prisma.PermissionOrderByWithRelationInput[]
) => {
    try {
        await checkAbility('read', 'Permission');

        const result = await permissionRepository.getAll(page, limit, where, orderBy);

        return {
            success: true,
            data: {
                data: result.data,
                meta: result.meta,
            },
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
            message: 'Something went wrong',
        };
    }
};

export const createPermissionAction = async (data: PermissionType) => {
    try {
        await checkAbility('create', 'Permission');

        await permissionRepository.create(data);

        return {
            success: true,
            message: 'Permission created successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to create permission',
        };
    }
};

export const updatePermissionAction = async (id: string, data: PermissionType) => {
    try {
        await checkAbility('update', 'Permission', data);

        await permissionRepository.update({id}, data);

        return {
            success: true,
            message: 'Permission updated successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to update permission',
        };
    }
};

export const deletePermissionAction = async (id: string) => {
    try {
        await checkAbility('delete', 'Permission');

        await permissionRepository.delete({id});

        return {
            success: true,
            message: 'Permission deleted successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to delete permission',
        };
    }
};
