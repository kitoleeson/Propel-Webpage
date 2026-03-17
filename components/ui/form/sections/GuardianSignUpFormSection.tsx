"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import FormTextInput from "@/components/ui/form/inputs/FormTextInput";
import FormPhoneInput from "@/components/ui/form/inputs/FormPhoneInput";
import FormSelectInput from "@/components/ui/form/inputs/FormSelectInput";
import FormRadioInput from "@/components/ui/form/inputs/FormRadioInput";
import type { FormValues } from "@/lib/validation/clientFormSchema";

const GuardianSection = ({ index }: { index: number }) => {
  const { register, formState: { errors } } = useFormContext<FormValues>();

  return (
    <>
      <h1>Guardian Information</h1>
      <div className='landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6'>
        <FormTextInput label='First Name' register={register(`guardians.${index}.gov_first`)} placeholder='Joyce' error={errors.guardians?.[index]?.gov_first?.message} />
        <FormTextInput label='Last Name' register={register(`guardians.${index}.gov_last`)} placeholder='Nakatumba' error={errors.guardians?.[index]?.gov_last?.message} />
        <FormTextInput label='Preferred Name (if applicable)' register={register(`guardians.${index}.pref_name`)} placeholder='Joy' error={errors.guardians?.[index]?.pref_name?.message} />
      </div>

      <div className='landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6'>
        <FormTextInput label='Email' type='email' register={register(`guardians.${index}.email`)} placeholder='joyce@example.ca' error={errors.guardians?.[index]?.email?.message} />
        <FormPhoneInput label='Phone' register={register(`guardians.${index}.phone`)} placeholder='(123) 456-7890' error={errors.guardians?.[index]?.phone?.message} />
        <FormRadioInput label='Preferred Communication' register={register(`guardians.${index}.pref_comm`)} options={['Email', 'Text Message']} error={errors.guardians?.[index]?.pref_comm?.message} />
      </div>

      <div className='landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6'>
      </div>
    </>
  );
};

export default GuardianSection;