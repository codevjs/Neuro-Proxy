import {z} from 'zod';

export const permissionSchema = z.object({
    id: z.string().optional(),
    name: z.string({message: 'Name is required'}),
    description: z.string().optional(),
    group: z.string({message: 'Group is required'}),
    subject: z.string({message: 'Subject is required'}),
    actions: z.array(z.string({message: 'Actions is required'})).min(1),
    fields: z.array(z.string()).optional(),
    conditions: z.any(),
    inverted: z.boolean().optional(),
    reason: z.string().optional(),
});

export type PermissionType = z.infer<typeof permissionSchema>;
