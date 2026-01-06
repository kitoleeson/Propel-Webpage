"use client";

import P5VizWrapper from "@/components/dom/P5Viz/P5VizWrapper";
import { P5SetupCallback, P5SketchCallback } from "@/utils/p5";

export default function Home() {

  const setup: P5SetupCallback = (p, colors) => {
    p.fill(colors.accent);
  }

  const draw: P5SketchCallback = (p, colors, scene) => {
    p.background(colors.background);
    p.ellipse(p.width / 2, p.height / 2, 100, 100);
  }
  
  return (
    <main>
      <P5VizWrapper title="P5 Sketch" setup={setup} draw={draw} />
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