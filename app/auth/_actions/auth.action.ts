'use server';

import {AuthError} from 'next-auth';

import container from '@/server-container';
import {signIn, signOut} from '@/auth';
import {UserRepository} from '@/repositories/database/(public)/user/user.db';
import {AuthRegisterRepistory} from '@/repositories/database/(public)/auth/register/register.db';

const userRepository = container.resolve(UserRepository);
const authRegisterRepistory = container.resolve(AuthRegisterRepistory);

export const checkSuperAdmin = async () => {
    try {
        const user = await userRepository.getAll(1, 1, {role: {name: 'superadmin'}});

        if (user.data.length > 0) return true;

        return false;
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
            };
        }

        return {
            success: false,
            message: 'Failed to sign out',
        };
    }
};

export const firstRegisterAction = async (data: {name: string; email: string; password: string}) => {
    try {
        await authRegisterRepistory.firsRegister(data);

        return {
            success: true,
            message: 'Super admin has been created',
        };
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
            };
        }

        return {
            success: false,
            message: 'Failed to sign out',
        };
    }
};

export const signInAction = async (email: string, password: string) => {
    try {
        const result = await signIn('credentials', {
            email: email,
            password: password,
            redirect: false,
        });

        return {
            success: true,
            message: `Welcome back, ${email}`,
        };
    } catch (error) {
        if (error instanceof Error) console.error(error.message);

        if (error instanceof AuthError) {
            return {
                success: false,
                message: error.cause?.err?.message ?? '',
            };
        }

        return {
            success: false,
            message: 'Failed to sign in',
        };
    }
};

export const signOutAction = async () => {
    try {
        await signOut({redirect: false});

        return {
            success: true,
            message: 'You have been signed out.',
        };
    } catch (error) {
        if (error instanceof AuthError) {
            return {
                success: false,
                message: error.cause?.err?.message ?? '',
            };
        }

        return {
            success: false,
            message: 'Failed to sign out',
        };
    }
};
