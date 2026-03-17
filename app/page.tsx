"use client";

import P5VizWrapper from "@/components/canvas/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";
import NavBar from "@/components/ui/NavBar";

export default function Home() {

  type Vec = {
    x: number;
    y: number;
  }
  
  let theta = 0;
  let radius = 0;
  let size = 200;
  let center: Vec;
  let lastPoint: Vec;
  let propeller: any;
  let x = 0;
  let r = 0;
  let state = "axes";
  let fadeColour: any;
  let numFades = 0;

  const logoPoint = (theta: number) => {
    radius = Math.pow(Math.cos((3/7) * theta), 2);
    return { x: radius * size * Math.cos(theta), y: radius * size * Math.sin(theta) } as Vec;
  }

  const drawLogo = (thickness: number, p: any, colors: any) => {
    const bounds = (a: number, b: number) => (Math.PI / 6) * (3 + (8 * a) + (14 * b));

    const image = p.createGraphics(p.width, p.height);
    image.clear();
    image.translate(center.x, center.y);
    for (let k = 0; k < 6; k++) for (let t = bounds(0, k); t < bounds(1, k); t += 0.005) {
      const point = logoPoint(t);
      image.stroke(colors.textPrimary);
      image.strokeWeight(1);
      image.ellipse(point.x, point.y, thickness);
    }
    return image;
  }

  const setup: P5SetupCallback = (p, colors, scene) => {
    p.background(colors.accent);

    const { canvasSize } = scene;
    center = {
      x: p.width / 2,
      y: p.height / 2,
    };

    fadeColour = p.color(colors.accent);
    fadeColour.setAlpha(25);

    lastPoint = logoPoint(theta);

    // draw logo
    propeller = drawLogo(1, p, colors);
  }
  
  const draw: P5SketchCallback = (p, colors, scene) => {
    const { canvasSize } = scene;
    let axisLen = p.millis() / 2;
    p.text(state, 10, 20);
    
    if (state == "axes") {
      p.stroke(colors.textPrimary);
      p.strokeWeight(1);
      p.line(center.x, center.y - axisLen, center.x, center.y + axisLen);
      p.line(center.x - axisLen, center.y, center.x + axisLen, center.y);
      if (axisLen >= p.width / 2 && axisLen >= p.height / 2) state = "logo";
    } else if (state == "logo") {
      p.stroke(colors.textPrimary);
      p.strokeWeight(2);

      // p.textSize(16);
      // p.text(`cos((3/7) * ${(theta / Math.PI).toFixed(2)}π)`, 10, 40);
      
      p.translate(center.x, center.y);
      const point = logoPoint(theta);
      p.line(lastPoint.x, lastPoint.y, point.x, point.y);
      lastPoint = point;
      theta += 0.1;
      if (theta > Math.PI * 14.1) state = "fade";
    } else if (state == "fade") {
      propeller = drawLogo(p.map(numFades, 0, 50, 1, 4), p, colors);
      p.fill(fadeColour);
      p.rect(0, 0, p.width, p.height);
      p.image(propeller, 0, 0);
      numFades++;
      if (numFades >= 50) state = "spin";
    } else if (state == "spin") {
      if (x < p.width / 4) x += 7;
      p.background(colors.accent);
      p.push();
      p.translate(center.x + x, center.y);
      p.rotate(r);
      p.image(propeller, -center.x, -center.y);
      p.pop();
      r -= 1;
    }
  }
  
  return (
    <main>
      <NavBar />
      <P5VizWrapper title="" setup={setup} draw={draw} />
      <div className="mx-7 my-10">
        <h1 className="text-6xl font-bold">Handing the keys back to students.</h1>
        <h2 className="pt-3 text-2xl">Propel Tutoring offers personalized, student-led tutoring that adapts to how you learn best. We seek to support students in taking ownership of their education, and build confidence in their learning.</h2>
        <p className="font-bold mt-15">Every student learns differently.</p>
        <p className="mt-2">
          Propel Tutoring is a catalyst for students taking ownership of, and investing in, their education.
          We believe students must have room to explore different learning styles and ways of thinking; because in this exploration, students gain a deeper understanding of their inner processes, setting them up for continued and fulfilling learning.
          Our personalized style adapts to individual goals, pace, and learning style, to help students understand how they learn best, and let them show us how best to help them.
          We meet students where they are and guide with intention, raising students' confidence and skills to new heights.
          Propel exists to give students the power to choose a style of learning which best suits them, and to break down the principles of math and science in the pursuit of intuitive understanding, not just memorization.
        </p>
      </div>
    </main>
  );
}