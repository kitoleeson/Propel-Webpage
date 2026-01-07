"use client";

import P5VizWrapper from "@/components/dom/P5Viz/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";

export default function Home() {

  // type Vec = {
  //   x: number;
  //   y: number;
  // }
  
  // let theta = 0;
  // let radius = 0;
  // let size = 250;
  // let center: Vec;
  // let lastPoint: Vec;
  // let points = [];

  // const setup: P5SetupCallback = (p, colors, scene) => {
  //   p.background(colors.accent);

  //   const { canvasSize } = scene;
  //   center = {
  //     x: canvasSize.width / 2,
  //     y: canvasSize.height / 2,
  //   };
  //   radius = p.pow(Math.cos((3/7) * theta), 2);
  //   lastPoint = { x: radius * size * Math.cos(theta), y: radius * size * Math.sin(theta) };
  // }
  
  // const draw: P5SketchCallback = (p, colors, scene) => {
  //   const { canvasSize } = scene;

  //   p.noStroke();
  //   p.fill(colors.accentDark);
  //   p.rect(20, 50, 150, 30);
  //   p.fill(colors.textPrimary);
  //   p.text("Size of points: " + points.length, 25, 70);

  //   p.stroke(colors.textPrimary);
  //   p.strokeWeight(2);
    
  //   p.translate(center.x, center.y);
  //   const point = { x: radius * size * Math.cos(theta), y: radius * size * Math.sin(theta) } as Vec;
  //   p.line(lastPoint.x, lastPoint.y, point.x, point.y);

  //   theta += 0.1;
  //   radius = p.pow(Math.cos((3/7) * theta), 2);
  //   lastPoint = point;

  //   if (p.dist(point.x, point.y, 0, 0) < size * 0.61) points.push(point);
  //   if (theta > p.TWO_PI * 7) p.background(colors.accent);
  //   for (let point of points){
  //     p.ellipse(point.x, point.y, 5);
  //   }
  // }
  
  type Vec = {
    x: number;
    y: number;
  };

  let theta = 0;
  let radius = 0;
  let size = 250;
  let center: Vec;

  let propeller: any;

  const setup: P5SetupCallback = (p, colors, scene) => {
    const { canvasSize } = scene;
    p.background(colors.accent);

    center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    theta = p.PI * (7 / 6);
    radius = p.pow(Math.cos((3 / 7) * theta), 2);

    // Create the offscreen buffer for the propeller
    propeller = p.createGraphics(canvasSize.width, canvasSize.height);
    propeller.translate(center.x, center.y);
    propeller.stroke(colors.textPrimary);
    propeller.strokeWeight(2);
  };

  const draw: P5SketchCallback = (p, colors, scene) => {
    const { canvasSize } = scene;

    // --- Fade the main canvas to create trailing effect ---
    p.fill(colors.accent + "33"); // semi-transparent background
    p.noStroke();
    p.rect(0, 0, canvasSize.width, canvasSize.height);

    p.push();
    p.translate(center.x, center.y);

    // Compute current point on pattern
    const x = radius * size * Math.cos(theta);
    const y = radius * size * Math.sin(theta);

    // Draw line to last point on main canvas
    if (theta > 0) {
      p.stroke(colors.textPrimary);
      p.strokeWeight(2);
      p.line(0, 0, x, y); // or draw your outer pattern line
    }
    p.pop();

    // --- Draw propeller into offscreen buffer ---
    const propX = radius * size * Math.cos(theta);
    const propY = radius * size * Math.sin(theta);
    propeller.stroke(colors.textPrimary);
    propeller.strokeWeight(5);
    propeller.point(propX, propY);

    // --- Render propeller buffer onto main canvas ---
    p.image(propeller, 0, 0);

    // Update for next frame
    theta += 0.05;
    radius = p.pow(Math.cos((3 / 7) * theta), 2);
  };
  
  return (
    <main>
      <P5VizWrapper title="Logo Generator" setup={setup} draw={draw} />
      {/* <Link className="text-blue-600"  href="/about">about</Link>
      <h1 className="bg-blue-300 pt-20 px-7 text-6xl font-bold">Helping students take charge of their learning.</h1>
      <h2 className="bg-blue-300 pt-5 pb-20 px-7 text-2xl">Personalized, student-led tutoring that adapts to how you learn best.</h2>
      <p className="font-bold mt-5">One-size-fits-all teaching doesn't work / Every student learns differently.</p>
      <p>
        Propel provides personalized tutoring that adapts to individual goals, pace, and learning style.
        We meet students where they are, guide with intention, and raise their confidence and skills to new heights.
        We help students understand how they learn best, and let them show us how best to help them.
      </p> */}
    </main>
  );
}