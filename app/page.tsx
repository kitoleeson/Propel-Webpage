/** @format */

"use client";

import NavBar from "@/components/ui/base_page/nav_bar/NavBar";
import Body from "@/components/ui/base_page/Body";
import HomePageLogoSketch from "@/components/canvas/HomePageLogoSketch";
import HighlightCard from "@/components/ui/highlight_card/HighlightCard";
import HighlightCardGrid from "@/components/ui/highlight_card/HighlightCardGrid";

export default function Home() {
	return (
		<>
			<NavBar />
			<main>
				<HomePageLogoSketch />
				<Body>
					<h1 className="text-6xl font-bold mb-12">Unlocking your key to learning.</h1>
					<h2>Propel Tutoring offers personalized, student-led tutoring. We believe in:</h2>
					<HighlightCardGrid>
						<HighlightCard title="Ownership" iconName="key">
							We learn more effectively when we take ownership of, and invest in, our learning.
						</HighlightCard>
						<HighlightCard title="Adaptability" iconName="chameleon">
							We all learn differently. Our teaching style must understand and adapt to each person.
						</HighlightCard>
						<HighlightCard title="Curiousity" iconName="magnifying_glass">
							We become more confident as we become more curious about a subject.
						</HighlightCard>
						<HighlightCard title="Foundation" iconName="roots">
							We deepen our understanding of a subject when we understand its core principles and learn how to apply it in a way that makes sense to us.
						</HighlightCard>
					</HighlightCardGrid>
					<p>
						Propel Tutoring is a catalyst: we give you the space and time to explore how you think and learn so that you can gain a deeper understanding of your own processes. We take our cues from you. Through our conversations
						and learning sessions you will show us how you like to learn and how we can best support you.
					</p>
					<h2>Our Promises</h2>
					<ul className="ml-5 list-disc list-inside space-y-2">
						<li>We promise to meet you where you are at and guide you with intention and thoughtfulness, increasing both your knowledge of specific topics and setting you up for future learning.</li>
						<li>We promise to adapt our teaching style to suit what works best for you.</li>
						<li>We promise to encourage you to build an intuitive understanding of subjects rather than simply memorize.</li>
						<li>We promise to listen to what you need and want to learn and tailor our sessions to achieve that.</li>
						<li>We promise to make our sessions together enjoyable, using different approaches and techniques.</li>
					</ul>
					<p>
						Engaging in a tutoring relationship means we have to work together and communicate honestly and frequently to make sure our sessions are fun and productive. We will check in with you regularly to make sure that you are
						accomplishing what you hope. We take our lead from you and use our experience and instinct to guide you towards fulfilling experiences. This starts from the get-go when you select the tutor you want to work with --
						check out our crew here and let's get started. (the "here" would be a link to the team--you want to end this section with a call to action)
					</p>
				</Body>
			</main>
		</>
	);
}
