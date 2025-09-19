import {readFileSync} from 'fs';

import {parsePrismaSchema} from '@loancrate/prisma-schema-parser';
import {singleton} from 'tsyringe';

import {BaseRepository} from '@/repositories/database/base.db';

@singleton()
export class SubjectRepository extends BaseRepository {
    async getAll() {
        const ast = parsePrismaSchema(readFileSync(__dirname.split('.next')[0] + '/prisma/schema.prisma', {encoding: 'utf8'}));

        const subjects = ast.declarations
            // @ts-ignore
            .map((d) => d.name?.value)
            .filter((d) => {
                return d !== undefined && d !== 'client' && d !== 'db' && d !== 'Account' && d !== 'Session' && d !== 'VerificationToken';
            });

        const snakeCase = (str: string) => {
            // lowercase the first letter
            str = str.charAt(0).toLowerCase() + str.slice(1);

            return str.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
        };

        return subjects.map((subject) => ({
            value: subject as string,
            label: subject as string,
        }));
    }
}
