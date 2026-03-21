/** @format */

"use client";

import P5VizWrapper from "@/components/canvas/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";
import NavBar from "@/components/ui/NavBar";
import Image from "next/image";
import { useCallback } from "react";
import type P5 from "p5";

export default function Home() {
	type Vec = {
		x: number;
		y: number;
	};

	type SketchState = {
		theta: number;
		radius: number;
		size: number;
		center: Vec;
		lastPoint: Vec;
		lastPoint2: Vec;
		propeller: any;
		x: number;
		r: number;
		state: string;
		fadeColour: any;
		numFades: number;
		mathFont: any;
		equationCoords: any;
		equationCoords2: any;
		previousFurthestTick: number;
	};

	const logoPoint = (theta: number, s: SketchState) => {
		s.radius = Math.pow(Math.cos((3 / 7) * theta), 2);
		return { x: s.radius * s.size * Math.cos(theta), y: s.radius * s.size * Math.sin(theta) } as Vec;
	};

	const drawLogo = (thickness: number, p: any, s: SketchState, colors: any) => {
		const bounds = (a: number, b: number) => (Math.PI / 6) * (3 + 8 * a + 14 * b);

		const image = p.createGraphics(p.width, p.height);
		image.clear();
		image.translate(s.center.x, s.center.y);
		for (let k = 0; k < 6; k++)
			for (let t = bounds(0, k); t < bounds(1, k); t += 0.005) {
				const point = logoPoint(t, s);
				image.stroke(colors.textPrimary);
				image.strokeWeight(1);
				image.ellipse(point.x, point.y, thickness);
			}
		return image;
	};

	const setup: P5SetupCallback = useCallback(async (p, colors, scene) => {
		const { canvasSize } = scene;
		p.background(colors.accent);

		let italic: any;
		try {
			italic = await p.loadFont("/fonts/computerModern-italic.ttf");
		} catch (error) {
			italic = null;
		}

		const ps = p as P5 & { state: SketchState };
		ps.state = {
			theta: 0,
			radius: 0,
			size: 200,
			center: { x: p.width / 2, y: p.height / 2 },
			lastPoint: { x: 0, y: 0 },
			lastPoint2: { x: 0, y: 0 },
			propeller: null,
			x: 0,
			r: 0,
			state: "axes",
			fadeColour: p.color(colors.accent),
			numFades: 0,
			mathFont: italic,
			equationCoords: { x: p.width - 10, y: p.height - 20 },
			equationCoords2: { x: 10, y: 20 },
			previousFurthestTick: 0,
		};

		const s = ps.state;
		s.fadeColour.setAlpha(50);
		s.lastPoint = logoPoint(s.theta, s);
		s.lastPoint2 = logoPoint(s.theta + 7 * Math.PI, s);
		s.propeller = drawLogo(1, p, s, colors);
		if (italic) p.textFont(italic);
	}, []);

	const axes = (p: any, colors: any, s: SketchState) => {
		let axisLen = p.millis();
		p.stroke(colors.textPrimary);
		p.strokeWeight(1);
		p.line(s.center.x, s.center.y - axisLen, s.center.x, s.center.y + axisLen);
		p.line(s.center.x - axisLen, s.center.y, s.center.x + axisLen, s.center.y);

		// ticks
		const furthestTick: number = Math.floor(axisLen / s.size) * s.size;
		for (let t = s.previousFurthestTick + s.size; t <= furthestTick; t += s.size) {
			// positive direction
			p.line(s.center.x + t, s.center.y - 5, s.center.x + t, s.center.y + 5);
			p.line(s.center.x - 5, s.center.y + t, s.center.x + 5, s.center.y + t);
			// negative direction
			p.line(s.center.x - t, s.center.y - 5, s.center.x - t, s.center.y + 5);
			p.line(s.center.x - 5, s.center.y - t, s.center.x + 5, s.center.y - t);
		}

		// update tracker
		s.previousFurthestTick = furthestTick;

		if (axisLen >= p.width / 2 && axisLen >= p.height / 2) s.state = "logo";
	};

	const logo = (p: any, colors: any, s: SketchState) => {
		p.stroke(colors.textPrimary);
		p.strokeWeight(2);

		// equation boxes
		p.push();
		p.stroke(colors.accent);
		p.fill(colors.accent);
		p.rect(s.equationCoords.x - 5, s.equationCoords.y + 5, -130, -30);
		p.rect(s.equationCoords.x - 5, s.equationCoords.y - 30, -90, -20);
		p.rect(s.equationCoords2.x + 5, s.equationCoords2.y - 5, 170, 30);

		// θ
		p.textAlign(p.RIGHT, p.CENTER);
		p.textSize(20);
		p.stroke(colors.textPrimary);
		p.fill(colors.textPrimary);
		p.strokeWeight(0.3);
		p.text(`θ = ${(s.theta / Math.PI).toFixed(2)}`, s.equationCoords.x - 10, s.equationCoords.y - 40);

		// equations: r = cos^2(3/7 θ), r = cos^2(3/7 θ + 7π)
		p.text("r = cos (  θ)", s.equationCoords.x - 10, s.equationCoords.y - 10);
		p.textAlign(p.LEFT, p.CENTER);
		p.text("r = cos (  θ + 7π)", s.equationCoords2.x + 10, s.equationCoords2.y + 10);
		p.textSize(15);
		p.text(`3`, s.equationCoords.x - 38, s.equationCoords.y - 18);
		p.text(`7`, s.equationCoords.x - 38, s.equationCoords.y - 2);
		p.text(`2`, s.equationCoords.x - 56, s.equationCoords.y - 18);
		p.text(`3`, s.equationCoords2.x + 94, s.equationCoords2.y + 2);
		p.text(`7`, s.equationCoords2.x + 94, s.equationCoords2.y + 18);
		p.text(`2`, s.equationCoords2.x + 76, s.equationCoords2.y + 2);

		// fraction lines
		p.strokeWeight(1);
		p.line(s.equationCoords.x - 38, s.equationCoords.y - 9.5, s.equationCoords.x - 28, s.equationCoords.y - 9.5);
		p.line(s.equationCoords2.x + 104, s.equationCoords2.y + 10, s.equationCoords2.x + 94, s.equationCoords2.y + 10);
		p.pop();

		// logo
		p.translate(s.center.x, s.center.y);
		const point = logoPoint(s.theta, s);
		p.line(s.lastPoint.x, s.lastPoint.y, point.x, point.y);
		s.lastPoint = point;
		const point2 = logoPoint(s.theta + 7 * Math.PI, s);
		p.line(s.lastPoint2.x, s.lastPoint2.y, point2.x, point2.y);
		s.lastPoint2 = point2;
		s.theta += 0.1;

		if (s.theta > Math.PI * 7.1) s.state = "fade";
	};

	const fade = (p: any, colors: any, s: SketchState) => {
		s.propeller = drawLogo(p.map(s.numFades, 0, 50, 1, 4), p, s, colors);
		p.fill(s.fadeColour);
		p.rect(0, 0, p.width, p.height);
		p.image(s.propeller, 0, 0);
		s.numFades++;
		if (s.numFades >= 25) s.state = "spin";
	};

	const spin = (p: any, colors: any, s: SketchState) => {
		const targetRotations = 2 * Math.PI;
		if (s.x < p.width / 4 && p.width - s.x > s.size) s.x += 7;
		else if (s.r >= targetRotations) s.state = "done";
		p.background(colors.accent);
		p.push();
		p.translate(s.center.x + s.x, s.center.y);
		p.rotate(s.r);
		p.image(s.propeller, -s.center.x, -s.center.y);
		p.pop();
		s.r += Math.PI / 80;
	};

	const done = (p: any, colors: any, s: SketchState) => {
		p.background(colors.accent);
		p.push();
		p.translate(s.center.x + s.x, s.center.y);
		p.image(s.propeller, -s.center.x, -s.center.y);
		p.pop();
	};

	const draw: P5SketchCallback = useCallback((p, colors, scene) => {
		const ps = p as P5 & { state: SketchState };
		const s = ps.state;

		if (s.state == "axes") axes(p, colors, s);
		else if (s.state == "logo") logo(p, colors, s);
		else if (s.state == "fade") fade(p, colors, s);
		else if (s.state == "spin") spin(p, colors, s);
		else if (s.state == "done") done(p, colors, s);
	}, []);

	return (
		<main>
			<NavBar />
			<P5VizWrapper title="" setup={setup} draw={draw} />
			<div className="mx-7 my-10">
				<h1 className="text-6xl font-bold">Handing the keys back to students.</h1>
				<h2 className="pt-3 text-2xl">
					Propel Tutoring offers personalized, student-led tutoring that adapts to how you learn best. We seek to support students in taking ownership of their education, and build confidence in their learning.
				</h2>
				<p className="font-bold mt-15">Every student learns differently.</p>
				<p className="mt-2">
					Propel Tutoring is a catalyst for students taking ownership of, and investing in, their education. We believe students must have room to explore different learning styles and ways of thinking; because in this
					exploration, students gain a deeper understanding of their inner processes, setting them up for continued and fulfilling learning. Our personalized style adapts to individual goals, pace, and learning style, to help
					students understand how they learn best, and let them show us how best to help them. We meet students where they are and guide with intention, raising students' confidence and skills to new heights. Propel exists to give
					students the power to choose a style of learning which best suits them, and to break down the principles of math and science in the pursuit of intuitive understanding, not just memorization.
				</p>
			</div>
		</main>
	);
}
