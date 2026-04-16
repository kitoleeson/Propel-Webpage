/** @format */

"use client";

import P5VizWrapper from "@/components/canvas/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";
import NavBar from "@/components/ui/NavBar";
import { useCallback } from "react";
import type P5 from "p5";
import { useAppStore } from "@/store/app";
import Body from "@/components/ui/Body";

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
		logoDisplacement: number;
		r: number;
		state: string;
		fadeColour: any;
		numFades: number;
		mathFont: any;
		titleFont: any;
		equationCoords: any;
		equationCoords2: any;
		previousFurthestTick: number;
		equations: any[];
		landscape: boolean;
	};

	const logoPoint = (theta: number, s: SketchState) => {
		s.radius = Math.pow(Math.cos((3 / 7) * theta), 2);
		return { x: s.radius * s.size * Math.cos(theta), y: s.radius * s.size * Math.sin(theta) } as Vec;
	};

	const updateLogoBuffer = (thickness: number, pg: any, s: SketchState, colors: any) => {
		pg.clear();
		pg.push();
		pg.translate(s.center.x, s.center.y);

		const bounds = (a: number, b: number) => (Math.PI / 6) * (3 + 8 * a + 14 * b);

		for (let k = 0; k < 6; k++) {
			for (let t = bounds(0, k); t < bounds(1, k); t += 0.005) {
				const point = logoPoint(t, s);
				pg.stroke(colors.textPrimary);
				pg.strokeWeight(1);
				pg.ellipse(point.x, point.y, thickness);
			}
		}
		pg.pop();
	};

	const setup: P5SetupCallback = useCallback(async (p, colors, scene) => {
		const { canvasSize } = scene;
		p.background(colors.accent);

		let computerModern: any;
		let gabarito: any;
		try {
			computerModern = await p.loadFont("/fonts/cmunrm.ttf");
			gabarito = await p.loadFont("/fonts/gabarito.ttf");
		} catch (error) {
			computerModern = null;
			gabarito = null;
		}

		const equations: any[] = [];
		equations.push(await p.loadImage("/images/equations/equation1.png"));
		equations.push(await p.loadImage("/images/equations/equation2.png"));
		equations.push(await p.loadImage("/images/equations/theta1.png"));
		equations.push(await p.loadImage("/images/equations/theta2.png"));

		const ps = p as P5 & { state: SketchState };
		ps.state = {
			theta: 0,
			radius: 0,
			size: p.min(p.width, p.height) * 0.48,
			center: { x: p.width / 2, y: p.height / 2 },
			lastPoint: { x: 0, y: 0 },
			lastPoint2: { x: 0, y: 0 },
			propeller: p.createGraphics(p.width || 480, p.height || 400),
			logoDisplacement: 0,
			r: 0,
			state: "axes",
			fadeColour: p.color(colors.accent),
			numFades: 0,
			mathFont: computerModern,
			titleFont: gabarito,
			equationCoords: { x: p.width - 10, y: p.height - 20 },
			equationCoords2: { x: 10, y: 20 },
			previousFurthestTick: 0,
			equations: equations,
			landscape: p.width > p.height,
		};

		const s = ps.state;
		s.fadeColour.setAlpha(50);
		s.lastPoint = logoPoint(s.theta, s);
		s.lastPoint2 = logoPoint(s.theta + 7 * Math.PI, s);

		// default text settings
		if (computerModern) p.textFont(computerModern);
		p.textAlign(p.RIGHT, p.CENTER);
		p.textSize(20);

		// equation images
		p.image(s.equations[0], s.equationCoords.x - 125, s.equationCoords.y - 22, s.equations[0].width / 2.2, s.equations[0].height / 2.2);
		p.image(s.equations[1], s.equationCoords2.x + 8, s.equationCoords2.y - 5, s.equations[1].width / 2.2, s.equations[1].height / 2.2);
		p.image(s.equations[2], s.equationCoords.x - 95, s.equationCoords.y - 48, s.equations[2].width / 2.2, s.equations[2].height / 2.2);
		p.image(s.equations[3], s.equationCoords2.x + 5, s.equationCoords2.y + 25, s.equations[3].width / 2.2, s.equations[3].height / 2.2);

		// θ
		p.fill(colors.textPrimary);
		p.text((s.theta / Math.PI).toFixed(2), s.equationCoords.x - 5, s.equationCoords.y - 40);
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
		// equation boxes
		p.noStroke();
		p.fill(colors.accent);
		p.rect(s.equationCoords.x - 5, s.equationCoords.y + 5, -120, -30);
		p.rect(s.equationCoords.x - 5, s.equationCoords.y - 30, -90, -20);
		p.rect(s.equationCoords2.x + 5, s.equationCoords2.y - 5, 125, 25);
		p.rect(s.equationCoords2.x + 5, s.equationCoords2.y + 25, 115, 20);

		// equation images
		p.image(s.equations[0], s.equationCoords.x - 125, s.equationCoords.y - 22, s.equations[0].width / 2.2, s.equations[0].height / 2.2);
		p.image(s.equations[1], s.equationCoords2.x + 8, s.equationCoords2.y - 5, s.equations[1].width / 2.2, s.equations[1].height / 2.2);
		p.image(s.equations[2], s.equationCoords.x - 95, s.equationCoords.y - 48, s.equations[2].width / 2.2, s.equations[2].height / 2.2);
		p.image(s.equations[3], s.equationCoords2.x + 5, s.equationCoords2.y + 25, s.equations[3].width / 2.2, s.equations[3].height / 2.2);

		// θ
		p.fill(colors.textPrimary);
		p.text((s.theta / Math.PI).toFixed(2), s.equationCoords.x - 5, s.equationCoords.y - 40);

		// logo
		p.stroke(colors.textPrimary);
		p.strokeWeight(2);
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
		if (!s.propeller || s.propeller.width === 0 || s.propeller.height === 0) return;

		p.fill(s.fadeColour);
		p.rect(0, 0, p.width, p.height);

		updateLogoBuffer(p.map(s.numFades, 0, 25, 1, 5), s.propeller, s, colors);
		p.image(s.propeller, 0, 0);

		s.numFades++;
		if (s.numFades >= 25) s.state = "spin";
	};

	const spin = (p: any, colors: any, s: SketchState) => {
		const targetRotations = p.max(Math.floor(p.width / 1655), 1) * Math.PI;
		if (s.landscape && s.logoDisplacement < p.width / 4 && p.width - s.logoDisplacement > s.size) s.logoDisplacement += 7;
		else if (!s.landscape && s.logoDisplacement < p.height / 4 && p.height - (s.center.y + s.logoDisplacement) > s.size / 1.3) s.logoDisplacement += 3;
		else if (s.r >= targetRotations) s.state = "done";
		p.background(colors.accent);
		p.push();
		s.landscape ? p.translate(s.center.x + s.logoDisplacement, s.center.y) : p.translate(s.center.x, s.center.y + s.logoDisplacement);
		p.rotate(s.r);
		p.image(s.propeller, -s.center.x, -s.center.y);
		p.pop();
		s.r += Math.PI / 80;
	};

	const done = (p: any, colors: any, s: SketchState) => {
		p.background(colors.accent);

		p.push();
		s.landscape ? p.translate(s.center.x + s.logoDisplacement, s.center.y) : p.translate(s.center.x, s.center.y + s.logoDisplacement);
		p.image(s.propeller, -s.center.x, -s.center.y);
		p.pop();

		p.textFont(s.titleFont);
		p.fill(colors.textPrimary);
		p.textSize(p.min(p.width / 6, p.height / 4));
		s.landscape ? p.textAlign(p.LEFT, p.CENTER) : p.textAlign(p.CENTER, p.TOP);
		const textCoords: Vec = s.landscape ? { x: p.width / 6, y: s.center.y } : { x: s.center.x, y: p.height / 12 };
		p.textStyle(p.BOLD);
		p.text("Propel\nTutoring", textCoords.x, textCoords.y);
		p.noLoop();
	};

	const draw: P5SketchCallback = useCallback((p, colors, scene) => {
		const ps = p as P5 & { state: SketchState };
		const s = ps.state;

		if (!s || !s.equations || s.equations.length < 4) return;

		if (s.state == "axes") axes(p, colors, s);
		else if (s.state == "logo") logo(p, colors, s);
		else if (s.state == "fade") fade(p, colors, s);
		else if (s.state == "spin") spin(p, colors, s);
		else if (s.state == "done") done(p, colors, s);
	}, []);

	const canvasWidth = useAppStore((s) => s.canvasSize.width);

	return (
		<main>
			<NavBar />
			<P5VizWrapper title="" key={`propel-canvas-${canvasWidth}`} setup={setup} draw={draw} />
			<Body>
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
			</Body>
		</main>
	);
}
