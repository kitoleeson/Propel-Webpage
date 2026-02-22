"use client";

import { useEffect, useRef, useMemo } from "react";
import P5Viz from "./P5Viz";
import { createSketch } from "@utils/p5";
import { useAppStore } from "@/store/app";

type Props = {
    setup: any;
    draw: any;
    title: string;
};

const P5VizWrapper = ({ setup, draw, title }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const sketch = useMemo(() => createSketch(setup, draw), [setup, draw]);
  const setCanvasSize = useAppStore((s) => s.setCanvasSize);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [setCanvasSize]);

  return <P5Viz ref={ref} title={title} sketch={sketch} height={480} />;
};


export default P5VizWrapper;