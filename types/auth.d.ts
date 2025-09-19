import type {DefaultSession, User as BaseUser} from '@auth/core/types';
import type {AdapterUser as BaseAdapterUser} from '@auth/core/adapters';

import {DefaultJWT} from 'next-auth/jwt';
import {Company, Role} from '@prisma/client';

declare module 'next-auth' {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            role?: Role;
            emailVerified: Date | null;
            name: string;
            company?: Company;
            /**
             * By default, TypeScript merges new interface properties and overwrites existing ones.
             * In this case, the default session user properties will be overwritten,
             * with the new ones defined above. To keep the default session user properties,
             * you need to add them back into the newly declared interface.
             */
        } & DefaultSession['user'];
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User extends BaseUser {
        role?: Role;
        company?: Company;
    }

    interface AdapterUser extends BaseAdapterUser {
        email: string;
        role?: Role;
        businessUnitId?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
        name: string;
        role?: Role;
        emailVerified: Date | null;
        company?: Company;
    }
}
