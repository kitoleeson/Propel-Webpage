"use client";
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormButtonInput, StudentSection, GuardianSection } from '@/components/ui/form';
import { defaultStudent, defaultGuardian, formSchema, FormValues } from '@/lib/validation/clientFormSchema';

const ClientSignUpForm = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: defaultStudent,
      guardians: [defaultGuardian],
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

  const guardianBilling = watch('student.biller') === 'guardian';
  
  const addGuardian = () => {
    append(defaultGuardian);
  }

  return (
    <div className='mt-10'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StudentSection />
          {fields.map((field, index) => (
            <div key={field.id} className='mt-10'>
              <GuardianSection index={index} />
              {fields.length > 1 && (
                <FormButtonInput label="Remove Guardian" onClick={() => remove(index)} format='text-red-500' />
              )}
            </div>
          ))}
          <FormButtonInput label="Add Another Guardian" onClick={addGuardian} />
          <FormButtonInput label="Sign Up" onClick={handleSubmit(onSubmit)} />
          <button type="submit" className='landscape:mt-6 portrait:mt-14'>Sign Up</button>
        </form>
      </FormProvider>
    </div>
  )
}

export default ClientSignUpForm