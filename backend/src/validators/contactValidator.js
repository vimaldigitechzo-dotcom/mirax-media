import { z } from 'zod';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;

/**
 * Validation schema for public contact enquiry submission.
 * Accepts both camelCase (fullName, companyName) and alternate keys (name, company_name)
 * from frontend forms and normalizes them cleanly.
 */
export const createContactSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters' })
      .max(150, { message: 'Full name cannot exceed 150 characters' })
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(150, { message: 'Name cannot exceed 150 characters' })
      .optional(),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email({ message: 'Please provide a valid email address' })
      .max(255, { message: 'Email address cannot exceed 255 characters' }),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(7, { message: 'Phone number must be at least 7 digits' })
      .max(20, { message: 'Phone number cannot exceed 20 characters' })
      .regex(phoneRegex, { message: 'Please provide a valid phone number' }),
    companyName: z
      .string()
      .trim()
      .max(150, { message: 'Company name cannot exceed 150 characters' })
      .optional()
      .nullable(),
    company_name: z
      .string()
      .trim()
      .max(150, { message: 'Company name cannot exceed 150 characters' })
      .optional()
      .nullable(),
    service: z
      .string({ required_error: 'Service selection is required' })
      .trim()
      .min(2, { message: 'Service name is required' })
      .max(100, { message: 'Service name cannot exceed 100 characters' }),
    budget: z
      .string()
      .trim()
      .max(100, { message: 'Budget cannot exceed 100 characters' })
      .optional()
      .nullable(),
    message: z
      .string({ required_error: 'Project message is required' })
      .trim()
      .min(5, { message: 'Message must be at least 5 characters' })
      .max(3000, { message: 'Message cannot exceed 3000 characters' }),
  })
  .refine((data) => data.fullName || data.name, {
    message: 'Full name is required',
    path: ['fullName'],
  })
  .transform((data) => ({
    fullName: (data.fullName || data.name || '').trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    companyName: (data.companyName || data.company_name || null)?.trim() || null,
    service: data.service.trim(),
    budget: data.budget?.trim() || null,
    message: data.message.trim(),
  }));

/**
 * Validation schema for updating enquiry status.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'], {
    errorMap: () => ({
      message: 'Status must be one of: NEW, CONTACTED, IN_PROGRESS, COMPLETED, REJECTED',
    }),
  }),
});

/**
 * UUID parameter validation schema.
 */
export const contactIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid enquiry ID. Must be a valid UUID.' }),
});

/**
 * Admin list query parameters schema.
 */
export const adminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z
    .enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
    .optional(),
  search: z.string().trim().optional(),
});
