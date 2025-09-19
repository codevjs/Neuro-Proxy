import {z} from 'zod';

export const tokenSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    token: z.string().optional(),
});

export type TokenType = z.infer<typeof tokenSchema>;
