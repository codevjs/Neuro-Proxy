import bcrypt from 'bcrypt';

import {BaseRepository} from '@/repositories/database/base.db';

export class AuthRegisterRepistory extends BaseRepository {
    async firsRegister(data: {name: string; email: string; password: string}) {
        // Check if super admin exists
        const user = await this.prisma.user.findFirst({
            where: {
                role: {
                    name: 'superadmin',
                },
            },
        });

        if (user) throw new Error('Super admin already exists');

        const role = await this.prisma.role.create({
            data: {
                name: 'superadmin',
                description: 'Role for super admin',
                permission: [
                    {
                        action: 'manage',
                        subject: 'all',
                    },
                ],
            },
        });

        const hashed = await bcrypt.hash(data.password, 10);

        await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashed,
                role: {
                    connect: {
                        id: role.id,
                    },
                },
            },
        });
    }
}
