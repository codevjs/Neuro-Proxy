'use server';

import bcrypt from 'bcrypt';
import {Prisma} from '@prisma/client';
import {ForbiddenError} from '@casl/ability';

import container from '@/server-container';
import {UserRepository} from '@/repositories/database/panel/user-management/user/user.db';
import {checkAbility} from '@/libs/casl-ability.lib';
import {RoleRepository} from '@/repositories/database/panel/user-management/role/role.db';
import {CompanyRepository} from '@/repositories/database/panel/user-management/company/company.db';

const userRepository = container.resolve(UserRepository);
const roleRepository = container.resolve(RoleRepository);
const companyRepository = container.resolve(CompanyRepository);

export const getAllUserAction = async (
    page: number,
    limit: number,
    where?: Prisma.UserWhereInput,
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
) => {
    try {
        await checkAbility('read', 'User');

        const result = await userRepository.getAll(page, limit, where, orderBy);

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

export const getAllRoleAction = async () => {
    try {
        await checkAbility('read', 'User');

        const result = await roleRepository.getAll(1, 30);

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

export const createUserAction = async (data: {name: string; email: string; password: string; role: string; company?: string}) => {
    try {
        await checkAbility('create', 'User');

        console.log(data);

        await userRepository.create(data);

        return {
            success: true,
            message: 'User created successfully',
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
            message: 'Failed to create user',
        };
    }
};

export const updateUserAction = async (id: string, data: {name: string; email: string; role: string; password?: string; company?: string}) => {
    try {
        await checkAbility('update', 'User');

        if (data.password && data.password.trim() !== '')
            await userRepository.update(
                {id},
                {
                    ...data,
                    password: bcrypt.hashSync(data.password, 10),
                }
            );
        else await userRepository.update({id}, data);

        return {
            success: true,
            message: 'User updated successfully',
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
            message: 'Failed to update user',
        };
    }
};

export const updateUserRoleAction = async (id: string, roleId: string) => {
    try {
        await checkAbility('update', 'User');

        await userRepository.updateRole({id}, roleId);

        return {
            success: true,
            message: 'User role updated successfully',
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
            message: 'Failed to update user role',
        };
    }
};

export const deleteUserAction = async (id: string) => {
    try {
        await checkAbility('delete', 'User');

        await userRepository.delete({id});

        return {
            success: true,
            message: 'User deleted successfully',
        };
    } catch (error) {
        if (error instanceof ForbiddenError)
            return {
                success: false,
                message: error.message,
            };

        return {
            success: false,
            message: 'Failed to delete user',
        };
    }
};

export const getCompanies = async () => {
    try {
        const result = await companyRepository.getAll(1, 100, undefined, {
            oracleName: 'asc',
        });

        return {
            success: true,
            data: {
                data: result.data,
                meta: result.meta,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: 'Something went wrong',
        };
    }
};
