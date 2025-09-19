/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16}}>
 *  Official <a href="https://www.prisma.io/docs">Prisma</a> adapter for Auth.js / NextAuth.js.
 *  <a href="https://www.prisma.io/">
 *   <img style={{display: "block"}} src="https://authjs.dev/img/adapters/prisma.svg" width="38" />
 *  </a>
 * </div>
 *
 * ## Installation
 *
 * ```bash npm2yarn
 * npm install @prisma/client @auth/prisma-adapter
 * npm install prisma --save-dev
 * ```
 *
 * @module @auth/prisma-adapter
 */
import type {PrismaClient, Prisma} from '@prisma/client';
import type {AdapterAccount, AdapterSession} from '@auth/core/adapters';
import type {Adapter} from '@/types';

import {AdapterUser} from 'next-auth';

export function PrismaAdapter(prisma: PrismaClient | ReturnType<PrismaClient['$extends']>): Adapter {
    const p = prisma as PrismaClient;

    return {
        // We need to let Prisma generate the ID because our default UUID is incompatible with MongoDB
        createUser: async ({id: _id, ...data}) => {
            const result = await p.user.create({
                data: {
                    id: _id,
                    email: data.email,
                    emailVerified: data.emailVerified,
                    name: data.name ?? '',
                },
            });

            return result;
        },
        getUser: async (id) => {
            const result = await p.user.findUnique({
                where: {id},
                include: {
                    role: true,
                },
            });

            return result ? {...result, role: result.role ?? undefined} : null;
        },
        getUserByEmail: async (email) => {
            const result = await p.user.findUnique({
                where: {email},
                include: {
                    role: true,
                },
            });

            return result ? {...result, role: result.role ?? undefined} : null;
        },
        async getUserByAccount(provider_providerAccountId) {
            const account = await p.account.findUnique({
                where: {provider_providerAccountId},
                include: {
                    user: {
                        include: {
                            role: true,
                        },
                    },
                },
            });

            return account?.user ? {...account.user, role: account.user.role ?? undefined} : null;
        },
        updateUser: async ({id, ...data}) => {
            const result = await p.user.update({
                where: {id},
                data: {
                    email: data.email,
                    emailVerified: data.emailVerified,
                    name: data.name ?? '',
                },
                include: {
                    role: true,
                },
            });

            return {...result, role: result.role ?? undefined};
        },
        deleteUser: (id) => p.user.delete({where: {id}}) as Promise<AdapterUser>,
        linkAccount: (data) => p.account.create({data}) as unknown as AdapterAccount,
        unlinkAccount: (provider_providerAccountId) =>
            p.account.delete({
                where: {provider_providerAccountId},
            }) as unknown as AdapterAccount,
        async getSessionAndUser(sessionToken) {
            const userAndSession = await p.session.findUnique({
                where: {sessionToken},
                include: {
                    user: {
                        include: {
                            role: true,
                        },
                    },
                },
            });

            if (!userAndSession) return null;

            const {user, ...session} = userAndSession;

            return {user, session} as {user: AdapterUser; session: AdapterSession};
        },
        createSession: (data) => p.session.create({data}),
        updateSession: (data) => p.session.update({where: {sessionToken: data.sessionToken}, data}),
        deleteSession: (sessionToken) => p.session.delete({where: {sessionToken}}),
        createVerificationToken: async (data) => {
            const verificationToken = await p.verificationToken.create({data});

            // @ts-expect-errors // MongoDB needs an ID, but we don't
            if (verificationToken.id) delete verificationToken.id;

            return verificationToken;
        },
        useVerificationToken: async (identifier_token) => {
            try {
                const verificationToken = await p.verificationToken.delete({
                    where: {identifier_token},
                });

                // @ts-expect-errors // MongoDB needs an ID, but we don't
                if (verificationToken.id) delete verificationToken.id;

                return verificationToken;
            } catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') return null;
                throw error;
            }
        },
        getAccount: async (providerAccountId, provider) => {
            const result = await p.account.findFirst({
                where: {
                    providerAccountId,
                    provider,
                },
            });

            return result as AdapterAccount | null;
        },
    };
}
