/** @format */

"use client";
import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormButtonInput, StudentSection, GuardianSection } from "@/components/ui/form";
import { defaultStudent, defaultGuardian, formSchema, FormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { placeholders } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";

// Source - https://stackoverflow.com/a/12646864
function shuffle(array: any[]) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

const ClientSignUpForm = () => {
	// useMemo(() => shuffle(placeholders), []);

	const methods = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			student: defaultStudent,
			guardians: [defaultGuardian],
		},
	});

	const { handleSubmit, watch, register, control } = methods;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "guardians",
	});

	const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
		console.log(data);
	};

	const guardianBilling = watch("student.biller") === "guardian";

	const addGuardian = () => {
		append(defaultGuardian);
	};

	return (
		<div className="mt-10">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<StudentSection placeholder={placeholders[0]} />
					{/* make it so that guardians are always shown when student is billed by guardian, but optionally added when not */}
					{fields.map((field, index) => (
						<div key={field.id} className="mt-10">
							<GuardianSection index={index} placeholder={placeholders[(index + 1) % placeholders.length]} />
							{fields.length > 1 && <FormButtonInput label="Remove Guardian" onClick={() => remove(index)} format="text-red-500" />}
						</div>
					))}
					<FormButtonInput label="Add Guardian" onClick={addGuardian} />
					<FormButtonInput label="Sign Up" onClick={handleSubmit(onSubmit)} format="self-stretch" />
				</form>
			</FormProvider>
		</div>
	);
};

export default ClientSignUpForm;
