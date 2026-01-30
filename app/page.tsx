"use client";

import P5VizWrapper from "@/components/dom/P5Viz/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";
import Link from "next/link";

export default function Home() {

  type Vec = {
    x: number;
    y: number;
  }
  
  let theta = 0;
  let radius = 0;
  let size = 250;
  let center: Vec;
  let lastPoint: Vec;
  let propeller: any;
  let x = 0;
  let r = 0;

  const logoPoint = (theta: number) => {
    radius = Math.pow(Math.cos((3/7) * theta), 2);
    return { x: radius * size * Math.cos(theta), y: radius * size * Math.sin(theta) } as Vec;
  }

  const setup: P5SetupCallback = (p, colors, scene) => {
    p.background(colors.accent);

    const { canvasSize } = scene;
    center = {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    };

    lastPoint = logoPoint(theta);

    // draw logo
    const bounds = (a: number, b: number) => (Math.PI / 6) * (3 + (8 * a) + (14 * b));
    
    propeller = p.createGraphics(canvasSize.width, canvasSize.height);
    propeller.clear();
    propeller.translate(center.x, center.y);
    for (let k = 0; k < 6; k++) for (let t = bounds(0, k); t < bounds(1, k); t += 0.005) {
      const point = logoPoint(t);
      propeller.stroke(colors.textPrimary);
      propeller.strokeWeight(2);
      propeller.ellipse(point.x, point.y, 4);
    }
  }
  
  const draw: P5SketchCallback = (p, colors, scene) => {
    const { canvasSize } = scene;
    
    p.stroke(colors.textPrimary);
    p.strokeWeight(2);
    
    p.translate(center.x, center.y);
    const point = logoPoint(theta);
    p.line(lastPoint.x, lastPoint.y, point.x, point.y);
    lastPoint = point;

    if (theta > Math.PI * 14) {
      p.fill(colors.accent);
      p.rect(-center.x, -center.y, canvasSize.width, 480);
      p.push();
      p.rotate(r);
      p.image(propeller, -center.x + x, -center.y);
      p.pop()
      // p.fill(colors.accent);
      // p.ellipse(0, 0, 85);
      r -= 1;
      // p.noLoop();
    }
    
    theta += 0.1;
  }
  
  return (
    <main>
      {/* <P5VizWrapper title="" setup={setup} draw={draw} /> */}
      <Link className="text-blue-600 px-4"  href="/about">about</Link>
      <Link className="text-blue-600 px-4"  href="/signup">signup</Link>
      <Link className="text-blue-600 px-4"  href="/support">support</Link>
      <h1 className="bg-blue-300 pt-20 px-7 text-6xl font-bold">Handing the keys back to students.</h1>
      <h2 className="bg-blue-300 pt-5 pb-20 px-7 text-2xl">Propel Tutoring offers personalized, student-led tutoring that adapts to how you learn best. We seek to support students in taking ownership of their education, and build confidence in their learning.</h2>
      <p className="font-bold mt-5">Every student learns differently.</p>
      <p>
        Propel Tutoring is a catalyst for students taking ownership of, and investing in, their education.
        We believe students must have room to explore different learning styles and ways of thinking; because in this exploration, students gain a deeper understanding of their inner processes, setting them up for continued and fulfilling learning.
        Our personalized style adapts to individual goals, pace, and learning style, to help students understand how they learn best, and let them show us how best to help them.
        We meet students where they are and guide with intention, raising students' confidence and skills to new heights.
        Propel exists to give students the power to choose a style of learning which best suits them, and to break down the principles of math and science in the pursuit of intuitive understanding, not just memorization.
      </p>
    </main>
  );
}