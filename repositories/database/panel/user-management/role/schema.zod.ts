import {z} from 'zod';

export const roleSchema = z.object({
    id: z.string().optional(),
    name: z.string({message: 'Name is required'}),
    description: z.string().optional(),
    permission: z
        .array(
            z.object({
                group: z.string({message: 'Group is required'}),
                subject: z.string({message: 'Subject is required'}),
                actions: z.array(z.string({message: 'Actions is required'})).min(1),
                fields: z.array(z.string()).optional(),
                conditions: z.any(),
                inverted: z.boolean().optional(),
                reason: z.string().optional(),
            })
        )
        .optional()
        .default([]),
});

export const rolePermissionSchema = z.object({
    subject: z.string({message: 'Subject is required'}),
    action: z.array(z.string({message: 'Actions is required'})).min(1),
});

export type RoleType = z.infer<typeof roleSchema>;

export type RolePermissionType = z.infer<typeof rolePermissionSchema>;
