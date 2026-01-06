"use client";

/**
 * P5Viz component to render a p5.js sketch within a React component.
 * Handles setup and teardown of the p5 instance.
*/

import { CSSProperties, ForwardedRef, forwardRef, useEffect, useRef } from "react";
import P5Container from "./P5Container";

type Props = {
  title: string;
  width?: CSSProperties["width"];
  height: CSSProperties["height"];
  sketch: (p: any) => void;
};

const P5Viz = ({ title, width = "100%", height, sketch, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
  const p5ref = useRef<any | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let p5Instance: any;
    const startP5 = async () => {
      if (divRef.current) {
        const p5 = (await import("p5"));
        p5Instance = new p5.default(sketch, divRef.current);
        p5ref.current = p5Instance;
      }
    };

    startP5();

    return () => {
      p5Instance?.remove();
    };

}, [sketch]);

  return (
    <P5Container ref={ref} className="p5-viz" title={title} width={width} height={height} {...props}>
      <div ref={divRef}></div>
    </P5Container>
  );
};

export default forwardRef(P5Viz);