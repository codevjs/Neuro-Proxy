import prisma, {prismaClientSingleton} from '@/libs/prisma.lib';

export class BaseRepository {
    protected prisma: ReturnType<typeof prismaClientSingleton>;

    constructor() {
        this.prisma = prisma;
    }
}
