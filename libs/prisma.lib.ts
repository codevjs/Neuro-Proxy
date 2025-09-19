import {PrismaClient} from '@prisma/client';
import pagination from 'prisma-extension-pagination';

export const prismaClientSingleton = () => {
    return new PrismaClient().$extends(pagination());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
