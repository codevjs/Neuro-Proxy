import {z} from 'zod';

export const ipWhitelistSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    ip: z.string().optional(),
});

export type IPWhitelistType = z.infer<typeof ipWhitelistSchema>;
