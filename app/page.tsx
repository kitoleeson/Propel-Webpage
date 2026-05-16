/** @format */

"use client";

import NavBar from "@/components/ui/base_page/nav_bar/NavBar";
import Body from "@/components/ui/base_page/Body";
import HomePageLogoSketch from "@/components/canvas/HomePageLogoSketch";
import HighlightCard from "@/components/ui/highlight_card/HighlightCard";
import HighlightCardStrictGrid from "@/components/ui/highlight_card/HighlightCardStrictGrid";
import HighlightCardFluidGrid from "@/components/ui/highlight_card/HighlightCardFluidGrid";
import TextUnderline from "@/components/ui/TextUnderline";
import Image from "next/image";

export default function Home() {
	return (
		<>
			<NavBar />
			<main>
				<HomePageLogoSketch />
				<Body space_y={12}>
					<h1 className="text-6xl font-bold">Unlocking your key to learning.</h1>
					<div className="space-y-5">
						<h2>Propel Tutoring offers personalized, student-led tutoring. We believe in:</h2>
						<HighlightCardStrictGrid>
							<HighlightCard title="Ownership" iconName="key">
								We learn more effectively when we take ownership of, and invest in, our learning.
							</HighlightCard>
							<HighlightCard title="Adaptability" iconName="chameleon">
								We all learn differently. Our teaching styles must understand and adapt to each person.
							</HighlightCard>
							<HighlightCard title="Curiousity" iconName="magnifying_glass">
								We become more confident as we become more curious about a subject.
							</HighlightCard>
							<HighlightCard title="Foundation" iconName="roots">
								We deepen our knowledge when we understand core principles and learn how to apply them in a way that is intuitive to us.
							</HighlightCard>
						</HighlightCardStrictGrid>
					</div>
					<h3>
						<TextUnderline textColour="text-primary" lineColour="bg-primary">
							Propel Tutoring is a catalyst:
						</TextUnderline>{" "}
						we give you the space and time to explore how you think and learn so that you can gain a deeper understanding of your own processes. We take our cues from you. Through our conversations and learning sessions you will
						show us how you like to learn and how we can best support you.
					</h3>
					<div className="space-y-5">
						<h2>Our Promises</h2>
						<HighlightCardFluidGrid>
							<HighlightCard textClass="text-primary!" bulge>
								We promise to meet you where you are at and guide you with intention and thoughtfulness, increasing your knowledge and setting you up for future learning.
							</HighlightCard>
							<HighlightCard textClass="text-primary!" bulge>
								We promise to adapt our teaching style to suit what works best for you.
							</HighlightCard>
							<HighlightCard textClass="text-primary!" bulge>
								We promise to encourage you to build an intuitive understanding of subjects, using applications which are meaningful to you.
							</HighlightCard>
							<HighlightCard textClass="text-primary!" bulge>
								We promise to listen to what you need and want to learn, and tailor our sessions to achieve that.
							</HighlightCard>
							<HighlightCard textClass="text-primary!" bulge>
								We promise to make our sessions together enjoyable, and share our interest and excitement in the subjects you are learning.
							</HighlightCard>
						</HighlightCardFluidGrid>
					</div>
					<p>
						Engaging in a tutoring relationship means we have to work together and communicate honestly and frequently to make sure our sessions are fun and productive. We will check in with you regularly to make sure that you are
						accomplishing what you hope. We take our lead from you and use our experience and instinct to guide you towards fulfilling experiences. This starts from the get-go when you select the tutor you want to work with --
						check out our crew here and let's get started. (the "here" would be a link to the team--you want to end this section with a call to action)
					</p>
				</Body>
				<div className="@container-size h-120 flex flex-col justify-center bg-primary overflow-hidden relative">
					<div className="absolute -translate-x-1/2 -translate-y-1/2 top-5/6 @landscape:left-auto @landscape:right-[-120cqh] @portrait:left-1/2 w-[175cqh] h-[175cqh] opacity-15 pointer-events-none z-0">
						<Image src="/images/logos/full-white.svg" alt="Propel Tutoring Logo Background" fill sizes="(max-width: 768px) 100vw, 1200px" priority className="object-contain" />
					</div>
					<h1 className="text-white whitespace-pre-line text-[min(20cqw,25cqh)] z-10 @landscape:ml-20 @portrait:mx-2 font-bold leading-[1.2] @landscape:text-left @portrait:text-center transition-all ease-in-out hover:scale-105">
						Sign Up Now!
					</h1>
				</div>
			</main>
		</>
	);
}
