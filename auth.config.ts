import type {AdapterUser, NextAuthConfig} from 'next-auth';

export default {
    session: {
        strategy: 'jwt',
        // 24 hours
        maxAge: 24 * 60 * 60,
    },
    pages: {signIn: '/auth/signin', error: '/auth/signin'},
    callbacks: {
        authorized: async ({auth}) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
        signIn({account, user}) {
            if (account)
                if (account.provider === 'linkedin' || account.provider === 'google') {
                    (user as AdapterUser).emailVerified = new Date();
                }

            return true;
        },
        jwt({token, trigger, session, user}) {
            if (user) {
                token.id = user.id ?? '';
                token.name = user.name ?? '';
                token.role = user.role;
                token.email = user.email;
                token.picture = user.image;
                token.emailVerified = (user as AdapterUser).emailVerified ?? null;
                token.company = user.company;
            }

            if (trigger === 'update' && session) {
                token = {...token, name: session.user.name, picture: session.user.image};

                return token;
            }

            return token;
        },
        session({session, token}) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.image = token.picture;
            session.user.role = token.role;
            session.user.emailVerified = token.emailVerified ?? null;
            session.user.company = token.company;

            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
