import {z} from 'zod';

export const registerSchema = z.object({
    userName: z.string().min(2, "Name required"),
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "Password required"),
    phone: z.string().min(10, "Phone is required")
});

export const loginSchema = z.object({
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "Password required")
});