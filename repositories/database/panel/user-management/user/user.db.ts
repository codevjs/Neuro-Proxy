import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';
import bcrypt from 'bcrypt';

import {userSchema} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class UserRepository extends BaseRepository {
    private schema = userSchema;

    async getOne(where: Prisma.UserWhereUniqueInput) {
        return await this.prisma.user.findUnique({
            where,
            include: {
                role: true,
            },
        });
    }

    async getAll(
        page: number,
        limit: number,
        where?: Prisma.UserWhereInput,
        orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
    ) {
        const [data, meta] = await this.prisma.user
            .paginate({
                where,
                orderBy,
                include: {
                    role: true,
                    company: true,
                },
            })
            .withPages({
                page,
                limit,
                includePageCount: true,
            });

        return {
            data,
            meta,
        };
    }

    async create(data: {name: string; email: string; password: string; role: string; company?: string}) {
        const user = await this.prisma.user.findUnique({where: {email: data.email}});

        if (user) throw new Error('User already exists, please sign in. if you forgot your password, you can reset it.');

        const hashed = await bcrypt.hash(data.password, 10);

        return await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashed,
                role: {
                    connect: {
                        id: data.role,
                    },
                },
                ...(data.company && {
                    company: {
                        connect: {
                            id: data.company,
                        },
                    },
                }),
            },
        });
    }

    async update(where: Prisma.UserWhereUniqueInput, data: {name: string; email: string; role: string; password?: string; company?: string}) {
        return await this.prisma.user.update({
            where,
            data: data.password
                ? {
                      name: data.name,
                      email: data.email,
                      password: data.password,
                      role: {
                          connect: {
                              id: data.role,
                          },
                      },
                      ...(data.company && {
                          company: {
                              connect: {
                                  id: data.company,
                              },
                          },
                      }),
                  }
                : {
                      name: data.name,
                      email: data.email,
                      role: {
                          connect: {
                              id: data.role,
                          },
                      },
                      ...(data.company && {
                          company: {
                              connect: {
                                  id: data.company,
                              },
                          },
                      }),
                  },
        });
    }

    async updateRole(where: Prisma.UserWhereUniqueInput, roleId: string) {
        return await this.prisma.user.update({
            where,
            data: {
                role: {
                    connect: {
                        id: roleId,
                    },
                },
            },
        });
    }

    async delete(where: Prisma.UserWhereUniqueInput) {
        return await this.prisma.user.delete({where});
    }
}
