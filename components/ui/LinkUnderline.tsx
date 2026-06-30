/** @format */

import Link from "next/link";
import { NavLink } from "./base_page/nav_bar/links";

const LinkUnderline = ({ link, showActive = true, className }: { link: NavLink; showActive?: boolean; className?: string }) => {
	return (
		<Link
			key={link.href}
			href={link.href}
			className={`nav-link group inline-block py-0.5 transition-all duration-300 ${showActive ? "font-bold" : "font-normal"} bg-linear-to-r from-current to-current bg-no-repeat bg-bottom bg-origin-center transition-[background-size] duration-200 ease-out hover:bg-size-[75%_2px] ${showActive ? "bg-size-[75%_2px]" : "bg-size-[0%_2px]"} ${className
				?.split(" ")
				.map((c) => `!${c}`)
				.join(" ")}`}
		>
			{link.anchor}
		</Link>
	);
};

export default LinkUnderline;
