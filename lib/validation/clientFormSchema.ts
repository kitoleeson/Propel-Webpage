import { z } from 'zod';

const personBase = z.object({
  gov_first: z.string().min(1, 'First name is required'),
  gov_last: z.string().min(1, 'Last name is required'),
  pref_name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  pref_comm: z.enum(['email', 'text message'], 'Preferred communication method is required'),
});

const studentSchema = personBase.extend({
  grade: z.number().min(1, 'Grade is required').max(12, 'Grade must be between 1 and 12'),
  city: z.string().min(1, 'City is required'),
  how_found: z.enum(['teacher', 'word of mouth', 'adversisement', 'web search', 'other']).optional().refine(val => val !== undefined, { message: 'Required' }),
  biller: z.enum(['student', 'guardian'], 'Biller is required'),
});

const guardianSchema = personBase.extend({
  relationship: z.string().min(1, 'Relationship is required'),
  is_primary_biller: z.boolean(),
});

export const defaultStudent: FormValues['student'] = {
  gov_first: '',
  gov_last: '',
  pref_name: '',
  email: '',
  phone: '',
  pref_comm: 'email',
  grade: 10,
  city: '',
  how_found: undefined,
  biller: 'guardian',
};

export const defaultGuardian: FormValues['guardians'][0] = {
  gov_first: '',
  gov_last: '',
  pref_name: '',
  email: '',
  phone: '',
  pref_comm: 'email',
  relationship: '',
  is_primary_biller: false,
};

export const formSchema = z.object({
  student: studentSchema,
  guardians: z.array(guardianSchema).min(1, 'At least one guardian is required'),
});

export type FormValues = z.infer<typeof formSchema>;