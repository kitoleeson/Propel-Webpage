"use client";
import React, { forwardRef } from "react";

/**
 * P5Container component to provide a container for p5.js sketches.
 * It sets up the dimensions and title display.
*/

type Props = {
  title?: string;
  width?: React.CSSProperties["width"];
  height?: React.CSSProperties["height"];
  className?: string;
  children: React.ReactNode;
};

const P5Container = forwardRef<HTMLDivElement, Props>( ({ title, width = "100%", height = 400, className, children }, ref) => {
    return (
      <div ref={ref} className={className} style={{ width, height, position: "relative" }}>
        {title && (<div style={{ position: "absolute", top: 8, left: 12, zIndex: 10, fontSize: 14, opacity: 0.8,}}>{title}</div>)}
        {children}
      </div>
    );
  }
);

export default P5Container;