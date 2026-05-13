/** @format */

"use client";

import P5VizWrapper from "@/components/canvas/P5VizWrapper";
import NavBar from "@/components/ui/NavBar";
import { useAppStore } from "@/store/app";
import Body from "@/components/ui/Body";
import { draw, setup } from "@/components/canvas/logo_sketch";

export default function Home() {
	const canvasWidth = useAppStore((s) => s.canvasSize.width);

	return (
		<>
			<NavBar />
			<main>
				<P5VizWrapper title="" key={`propel-canvas-${canvasWidth}`} setup={setup} draw={draw} />
				<Body>
					<h1 className="text-6xl font-bold">Handing the keys back to students.</h1>
					<h2>Propel Tutoring offers personalized, student-led tutoring that adapts to how you learn best. We seek to support students in taking ownership of their education, and build confidence in their learning.</h2>
					<p className="font-bold mt-15">Every student learns differently.</p>
					<p>
						Propel Tutoring is a catalyst for students taking ownership of, and investing in, their education. We believe students must have room to explore different learning styles and ways of thinking; because in this
						exploration, students gain a deeper understanding of their inner processes, setting them up for continued and fulfilling learning. Our personalized style adapts to individual goals, pace, and learning style, to help
						students understand how they learn best, and let them show us how best to help them. We meet students where they are and guide with intention, raising students' confidence and skills to new heights. Propel exists to
						give students the power to choose a style of learning which best suits them, and to break down the principles of math and science in the pursuit of intuitive understanding, not just memorization.
					</p>
				</Body>
			</main>
		</>
	);
}
