"use client";
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import FormTextInput from '@/components/ui/form/inputs/FormTextInput';
import FormPhoneInput from '@/components/ui/form/inputs/FormPhoneInput';
import FormSelectInput from '@/components/ui/form/inputs/FormSelectInput';
import FormRadioInput from '@/components/ui/form/inputs/FormRadioInput';
import StudentSection from '@/components/ui/form/sections/StudentSignUpFormSection';

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
  how_found: z.enum(['teacher', 'word of mouth', 'adversisement', 'web search', 'other']),
  biller: z.enum(['student', 'guardian'], 'Biller is required'),
});

const guardianSchema = personBase.extend({
  relationship: z.string().min(1, 'Relationship is required'),
  is_primary_biller: z.boolean(),
});

const formSchema = z.object({
  student: studentSchema,
  guardians: z.array(guardianSchema).min(1, 'At least one guardian is required'),
});

export type FormValues = z.infer<typeof formSchema>;

const ClientSignUpForm = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: {},
      guardians: [{}],
    }
  });

  const { handleSubmit, watch, register, control } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guardians',
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    console.log(data)
  }

  return (
    <div className='mt-10'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StudentSection />
          <button type="submit" className='landscape:mt-6 portrait:mt-14'>Sign Up</button>
        </form>
      </FormProvider>
    </div>
  )
}

export default ClientSignUpForm