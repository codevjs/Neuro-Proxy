import {z} from 'zod';

export const userSchema = z
    .object({
        id: z.string().optional(),
        name: z.string({
            message: 'Name is required',
        }),
        image: z.string().optional(),
        email: z
            .string({
                message: 'Email is required',
            })
            .email('Please enter a valid email'),
        password: z
            .string({
                message: 'Password is required',
            })
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        confirm: z.string({
            message: 'Confirm password is required',
        }),
        terms: z
            .boolean({
                message: 'You must agree to the terms and conditions',
            })
            .refine((value) => value === true, 'You must agree to the terms and conditions'),
    })
    .refine((data) => data.password === data.confirm, {
        path: ['confirm'],
        message: 'Passwords must match',
    });

export type UserType = z.infer<typeof userSchema>;
