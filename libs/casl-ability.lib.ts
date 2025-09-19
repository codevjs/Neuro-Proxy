import {AbilityBuilder, RawRule} from '@casl/ability';
import {Session} from 'next-auth';
import {Prisma} from '@prisma/client';
import {createPrismaAbility} from '@casl/prisma';
import {ForbiddenError, subject} from '@casl/ability';

import prisma from './prisma.lib';

import {auth} from '@/auth';

export async function defineAbility() {
    const session: Session | null = await auth();

    if (!session) throw new Error('You must be authenticated to define abilities');

    const role = await prisma.role.findUnique({
        where: {
            id: session.user.role?.id,
        },
        select: {
            permission: true,
        },
    });

    const {can, build} = new AbilityBuilder(createPrismaAbility);

    if (role) {
        const permissions: RawRule[] =
            (role.permission as Prisma.JsonObject[]).map((item) => ({
                action: (item.action as string[]) ?? [],
                subject: (item.subject as string[]) ?? [],
                fields: item.fields as string[],
                conditions: item.conditions as object,
                inverted: item.inverted as boolean | undefined,
                reason: item.reason as string | undefined,
            })) || [];

        permissions.forEach((permission) => {
            can(permission.action, permission.subject, permission.fields, permission.conditions);
        });
    }

    return build();
}

export async function checkAbility(action: string, subjectAccess: string, obj: object = {}) {
    const ability = await defineAbility();

    ForbiddenError.from(ability).throwUnlessCan(action, subject(subjectAccess, obj));
}
