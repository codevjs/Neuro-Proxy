import {z} from 'zod';

export const companySchema = z.object({
    id: z.string().optional(),
    uid: z.string({message: 'UID is required'}),
    name: z.string({message: 'Name is required'}),
    oracleName: z.string().optional(),
});

export type CompanyType = z.infer<typeof companySchema>;
