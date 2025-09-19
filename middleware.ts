import NextAuth from 'next-auth';
import {NextResponse} from 'next/server';

import authConfig from '@/auth.config';
import {ROOT} from '@/libs/routes.lib';

const {auth} = NextAuth(authConfig);

export default auth((req) => {
    const {nextUrl} = req;

    const isAuthenticated = !!req.auth;

    const role = req.auth?.user?.role?.name;

    if ((nextUrl.pathname.startsWith('/panel') && !isAuthenticated) || (nextUrl.pathname.startsWith('/panel') && role === undefined))
        return NextResponse.rewrite(new URL(ROOT, req.url));
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|images|home|property|view|auth).*)'],
};
