/** @format */

"use client";

import NavBar from "@/components/ui/base_page/nav_bar/NavBar";
import Body from "@/components/ui/base_page/Body";
import HomePageLogoSketch from "@/components/canvas/HomePageLogoSketch";
import HighlightCard from "@/components/ui/highlight_card/HighlightCard";
import HighlightCardStrictGrid from "@/components/ui/highlight_card/HighlightCardStrictGrid";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<>
			<NavBar />
			<main>
				<HomePageLogoSketch />
				<Body space_y={12}>
					<h1 className="text-6xl font-bold">Accelerating your learning.</h1>
					<div className="space-y-5">
						<h2>
							At Propel Tutoring, we take our cues from you. We are a catalyst for your learning: through our conversations and sessions, you will better understand your own learning processes. This will give us the insight we
							need to make sure that your learning is moving forward. We believe in:
						</h2>
						<HighlightCardStrictGrid>
							<HighlightCard title="Ownership" iconName="key">
								We ask you to invest in your own learning. Our job is to facilitate, teach, encourage, and share our passion.
							</HighlightCard>
							<HighlightCard title="Adaptability" iconName="chameleon">
								We tailor how we teach to suit how you learn. We welcome all students and, together, will figure out how you best like to learn.
							</HighlightCard>
							<HighlightCard title="Curiousity" iconName="magnifying_glass">
								We will ask questions that deepen your curiousity and prompt you to ask even more questions. Curiousity is key to increasing confidence on a subject.
							</HighlightCard>
							<HighlightCard title="Foundation" iconName="roots">
								We base our learning on the core principles of a subject, then apply them in ways that are inspiring to you, setting you up for learning now and in the future.
							</HighlightCard>
						</HighlightCardStrictGrid>
					</div>
					<div className="space-y-5 bg-primary-hover p-7 rounded-2xl inset-shadow-sm shadow-black">
						<h2 className="text-white font-bold text-3xl">Our Promises</h2>
						<ul className="space-y-3 text-white font-semibold list-disc pl-10">
							<li>We promise to meet you where you are at and guide you to increase your knowledge of specific topics and to set you up for future learning.</li>
							<li>We promise to promote an intuitive understanding of subjects rather than simply memorizing them.</li>
							<li>We promise to listen and tailor our sessions to achieve what you want to learn.</li>
							<li>We promise to make our sessions together enjoyable and will use various learning approaches and techniques.</li>
						</ul>
					</div>
					<div className="space-y-3">
						<h2 className="font-bold text-3xl">Working Together</h2>
						<p>
							In tutoring, we have responsibilities to each other. Frequent communication will ensure our sessions are fun and productive. Be proactive in letting us know what is working for you and where we need to make
							adjustments. We will take our lead from you and use our experience to help you power up. This starts from the get-go when you select the tutor you want to work with.{" "}
							{
								<Link
									key={"/about"}
									href={"/about"}
									className="inline font-bold duration-300 text-primary hover:text-primary-hover bg-linear-to-r from-current to-current  bg-size-[0%_2px] bg-no-repeat bg-bottom hover:bg-size-[98%_2px] transition-[background-size] ease-out"
								>
									Check out our crew here
								</Link>
							}{" "}
							and let's get started.
						</p>
					</div>
				</Body>
				<Link key={"/signup"} href={"/signup"} className="group @container-size h-60 flex flex-col justify-center bg-primary overflow-hidden relative">
					<div className="absolute -translate-x-1/2 -translate-y-1/2 top-5/6 @landscape:left-auto @landscape:right-[-120cqh] @portrait:left-1/2 w-[175cqh] h-[175cqh] opacity-15 pointer-events-none z-0">
						<Image src="/images/logos/full-white.svg" alt="Propel Tutoring Logo Background" fill sizes="(max-width: 768px) 100vw, 1200px" priority className="object-contain" />
					</div>
					<h1 className="text-white whitespace-pre-line text-[min(20cqw,25cqh)] z-10 @landscape:ml-20 @portrait:mx-2 font-bold leading-[1.2] @landscape:text-left @portrait:text-center transition-all ease-in-out group-hover:tracking-wide">
						Sign Up Now!
					</h1>
				</Link>
			</main>
		</>
	);
}
