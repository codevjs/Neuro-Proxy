import NextAuth from 'next-auth';
import Credentials from '@auth/core/providers/credentials';
import bcrypt from 'bcrypt';
import {PrismaClient} from '@prisma/client';

import authConfig from './auth.config';

import {PrismaAdapter} from '@/libs/prisma-adapter.lib';

const prisma = new PrismaClient();

export const {
    handlers: {GET, POST},
    unstable_update,
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        // @ts-ignore
        Credentials({
            id: 'credentials',
            name: 'credentials',
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {label: 'email'},
                password: {label: 'password', type: 'password'},
            },
            authorize: async (credentials) => {
                try {
                    const user = await prisma.user.findUnique({
                        where: {email: credentials.email as string},
                        include: {
                            role: true,
                        },
                    });

                    if (!user)
                        // No user found, so this is their first attempt to login
                        // meaning this is also the place you could do registration
                        throw new Error('No user found, please register first or check your email/password.');

                    // Check the password
                    const isValid = bcrypt.compareSync(credentials.password as string, user.password as string);

                    if (!isValid)
                        // Password doesn't match
                        throw new Error('Invalid credentials, please check your email/password.');

                    // return user object with the their profile data
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role ?? undefined,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw error;
                }
            },
        }),
    ],
});
