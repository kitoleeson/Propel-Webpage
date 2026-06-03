/** @format */

import { useState, useRef, useEffect } from "react";
import { FormDataListInputProps } from ".";

const SUBJECT_CATEGORIES: Record<string, string[]> = {
	math: ["Math 10 (AP)", "Math 20 (AP)", "Math 30 (AP)"],
	advanced_math: ["Math 31 (AP)", "Math 35 (AP)", "Stats 35 (AP)"],
	science: ["Science 10", "Science 20", "Science 30"],
	physics: ["Physics 20 (AP)", "Physics 30 (AP)"],
	chemistry: ["Chemistry 20 (AP)", "Chemistry 30 (AP)"],
	biology: ["Biology 20 (AP)", "Biology 30 (AP)"],
	computer_science: ["Comp Sci 10", "Comp Sci 20 (AP)", "Comp Sci 30 (AP)"],
	social_studies: ["Social 10 (AP)", "Social 20 (AP)", "Social 30 (AP)"],
	english: ["English 10 (AP)", "English 20 (AP)", "English 30 (AP)"],
	languages: ["French 10-30", "Spanish 10-30", "German 10-30"],
};

const formatCategoryName = (key: string) => {
	return key
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

const FormDataListInput = (props: FormDataListInputProps) => {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const closeDropdown = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
		};
		document.addEventListener("mousedown", closeDropdown);
		return () => document.removeEventListener("mousedown", closeDropdown);
	}, []);

	const selectOption = (option: string) => {
		const updated = [...selected, option];
		setSelected(updated);
		setQuery("");
		if (props.onChange) props.onChange(updated);
		inputRef.current?.focus();
	};

	const removeOption = (optionToRemove: string) => {
		const updated = selected.filter((opt) => opt !== optionToRemove);
		setSelected(updated);
		if (props.onChange) props.onChange(updated);
	};

	const removeOptionOnBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && query === "" && selected.length > 0) removeOption(selected[selected.length - 1]);
	};

	return (
		<div className={`w-full flex flex-col gap-1 flex-1 portrait:mt-2 relative ${props.divFormat}`}>
			<label>{props.label}</label>

			<div ref={containerRef} className="relative w-full">
				{/* Input Field */}
				<div onClick={() => inputRef.current?.focus()} className="flex flex-wrap gap-2 p-2 rounded-md ring ring-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-700 items-center">
					{selected.map((option) => (
						<span key={option} className="flex items-center gap-1 border border-primary text-primary-hover text-xs px-2 py-1 font-bold rounded-xl">
							{option}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									removeOption(option);
								}}
								className="text-primary hover:text-primary-hover font-bold focus:outline-none"
							>
								&times;
							</button>
						</span>
					))}
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsOpen(true)}
						onKeyDown={removeOptionOnBackspace}
						placeholder={selected.length ? "" : props.placeholder}
						className={`flex-1 min-w-15 outline-none ${props.format}`}
						disabled={props.disabled}
					/>
				</div>

				{/* Dropdown List */}
				{isOpen && (
					<div className="absolute z-10 w-full top-full left-0 mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto p-4 flex flex-col gap-4">
						<div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-x-5 gap-y-2">
							{Object.entries(SUBJECT_CATEGORIES).map(([categoryKey, options]) => {
								const selectedOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()) && !selected.includes(option));
								if (selectedOptions.length === 0) return null;

								return (
									<div key={categoryKey} className="w-[95%] mx-auto flex flex-col gap-x-1.5">
										<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-0.5">{formatCategoryName(categoryKey)}</h4>
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-1">
											{selectedOptions.map((option) => (
												<div
													key={option}
													onClick={() => selectOption(option)}
													className="px-2.5 py-1.5 text-sm hover:bg-primary-faded rounded cursor-pointer transition-colors border border-transparent hover:border-primary-faded-hover"
												>
													{option}
												</div>
											))}
										</div>
									</div>
								);
							})}
						</div>

						{Object.values(SUBJECT_CATEGORIES)
							.flat()
							.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt)).length === 0 && <p className="text-gray-400 text-center py-2">No matching subjects found.</p>}
					</div>
				)}
			</div>

			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
};

export default FormDataListInput;
