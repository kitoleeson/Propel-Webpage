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
		console.log("Form submitted with data:");
		console.log(data);
	};

	const guardianBilling = watch("student.biller") === "guardian";

	const addGuardian = () => {
		append(defaultGuardian);
	};

	const biller_index = watch("primary_biller_index");
	const removeGuardian = (index: number) => {
		remove(index);
		if (biller_index === index) {
			setValue("primary_biller_index", 0);
		} else if (biller_index > index) {
			setValue("primary_biller_index", biller_index - 1);
		}
	};

	return (
		<div className="mt-10">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<StudentSection placeholder={shuffledPlaceholders[0]} />
					{/* make it so that guardians are always shown when student is billed by guardian, but optionally added when not */}
					{fields.map((field, index) => (
						<div key={field.id} className="mt-10">
							<GuardianSection index={index} placeholder={shuffledPlaceholders[(index + 1) % shuffledPlaceholders.length]} optional={!guardianBilling || index > 0} />
							{fields.length > 1 && (
								<div className="landscape:mt-6 portrait:mt-14 flex flex-row gap-6 items-center">
									<FormButtonInput label="Remove Guardian" onClick={() => removeGuardian(index)} format="self-auto text-red-500 flex-1" />
									<div className="flex flex-col gap-1 flex-1">
										<label key={index} className="flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-3 py-1">
											<input type="radio" value={index} {...register("primary_biller_index", { valueAsNumber: true })} />
											{"Guardian is Primary Biller"}
										</label>
										{errors.primary_biller_index?.message && <p className="text-red-500">{errors.primary_biller_index?.message}</p>}
									</div>
								</div>
							)}
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
