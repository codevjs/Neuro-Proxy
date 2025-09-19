import {RawRule} from '@casl/ability';
import {Session} from 'next-auth';
import {Prisma} from '@prisma/client';

import prisma from './prisma.lib';

export const getPermissions = async (session: Session): Promise<RawRule[]> => {
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id ?? '',
        },
        include: {
            role: true,
        },
    });

    if (!user) throw new Error('User not found');

    const permissions: RawRule[] =
        (user.role?.permission as Prisma.JsonObject[]).map((item) => ({
            action: (item.action as string[]) ?? [],
            subject: (item.subject as string[]) ?? [],
            fields: item.fields as string[],
            conditions: item.conditions as any,
            inverted: item.inverted as boolean | undefined,
            reason: item.reason as string | undefined,
        })) || [];

    return permissions;
};
