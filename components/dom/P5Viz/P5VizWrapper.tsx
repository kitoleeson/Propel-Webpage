"use client";

import { useEffect, useRef, useState } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import P5Viz from "./P5Viz";
import { createSketch } from "@utils/p5";

type Props = {
  setup: any;
  draw: any;
  title: string;
};

const P5VizWrapper = ({ setup, draw, title }: Props) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const sketch = createSketch(setup, draw);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useResizeObserver(ref, (entry) => {
        if (!mounted || !ref.current) return;
        const { width, height } = entry.contentRect;
        const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement;
        if (canvas) {
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        }
    });

    return <P5Viz ref={ref} title={title} sketch={sketch} height={480} />;
};

export default P5VizWrapper;