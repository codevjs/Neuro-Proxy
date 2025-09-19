import {Prisma} from '@prisma/client';
import {singleton} from 'tsyringe';

import {companySchema} from './schema.zod';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class CompanyRepository extends BaseRepository {
    private schema = companySchema;

    async getAll(
        page: number,
        limit: number,
        where?: Prisma.CompanyWhereInput,
        orderBy?: Prisma.CompanyOrderByWithRelationInput | Prisma.CompanyOrderByWithRelationInput[]
    ) {
        const [data, meta] = await this.prisma.company
            .paginate({
                where,
                orderBy,
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
}
