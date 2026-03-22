/** @format */

"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormButtonInput, StudentSection, GuardianSection } from "@/components/ui/form";
import { defaultStudent, defaultGuardian, formSchema, FormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { placeholders } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";

function shuffle(array: any[]) {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

const ClientSignUpForm = () => {
	const [shuffledPlaceholders, setShuffledPlaceholders] = useState(placeholders);

	useEffect(() => {
		setShuffledPlaceholders(shuffle(placeholders));
	}, []);

	const methods = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			student: defaultStudent,
			guardians: [defaultGuardian],
			primary_biller_index: 0,
		},
	});

	const {
		register,
		formState: { errors },
		handleSubmit,
		watch,
		control,
		setValue,
	} = methods;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "guardians",
	});

	const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
		data.guardians[data.primary_biller_index].is_primary_biller = true;
		console.log("Form submitted with data:");
		console.log(data);
	};

	const guardianBilling = watch("student.biller") === "guardian";

	const addGuardian = () => {
		const current = methods.getValues("primary_biller_index");
		append(defaultGuardian);
		setValue("primary_biller_index", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
	};

	const removeGuardian = (index: number) => {
		const current = methods.getValues("primary_biller_index");
		if (current == index) setValue("primary_biller_index", 0, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		else if (current > index) setValue("primary_biller_index", current - 1, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		else setValue("primary_biller_index", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		remove(index);
	};

	return (
		<div className="mt-10">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<StudentSection placeholder={shuffledPlaceholders[0]} />
					{fields.map((field, index) => (
						<div key={field.id} className="landscape:mt-10 portrait:mt-14">
							<GuardianSection index={index} placeholder={shuffledPlaceholders[(index + 1) % shuffledPlaceholders.length]} optional={!guardianBilling || index > 0} />
							{fields.length > 1 && (
								<div className="flex flex-row gap-6 items-center">
									<FormButtonInput label="Remove Guardian" onClick={() => removeGuardian(index)} format="self-stretch text-red-500 flex-1" />
									{guardianBilling && (
										<div className="mt-6 flex flex-col gap-1 flex-1">
											<label key={index} className="flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-3 py-1 text-center">
												<input type="radio" value={index} checked={watch("primary_biller_index") === index} onChange={() => setValue("primary_biller_index", index)} />
												{"Is Primary Biller"}
											</label>
											{errors.primary_biller_index?.message && <p className="text-red-500">{errors.primary_biller_index?.message}</p>}
										</div>
									)}
								</div>
							)}
						</div>
					))}
					<FormButtonInput label="Add New Guardian" onClick={addGuardian} divFormat="mt-14" format="w-full" />
					<FormButtonInput label="Sign Up" onClick={handleSubmit(onSubmit)} format="self-stretch text-primary font-bold text-primary" />
				</form>
			</FormProvider>
		</div>
	);
};

export default ClientSignUpForm;
