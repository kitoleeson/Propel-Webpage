/** @format */

import { CanvasSize, useAppStore } from "@store/app";
import { GraphicsColors, colors } from "@theme/graphics";
import p5 from "p5";

interface P5SceneInfo {
	canvasSize: CanvasSize;
}

export type P5SetupCallback = (p: p5, colors: GraphicsColors, scene: P5SceneInfo) => void;
export type P5SketchCallback = (p: p5, colors: GraphicsColors, scene: P5SceneInfo) => void | Promise<void>;

/**
 * Wrapper for the `sketch` prop passed to P5 to create blog viz.
 * Handles sensible defaults like setting canvas size.
 * @param setup
 * @param draw
 * @returns
 */

export const createSketch = (setup: P5SetupCallback, draw: P5SketchCallback) => {
	let canvasSize = { width: 480, height: 400 };

	return (p: p5) => {
		p.setup = async () => {
			const { canvasSize: canvasSizeStore } = useAppStore.getState();
			canvasSize.width = canvasSizeStore.width;
			//   canvasSize.height = canvasSizeStore.height;

			p.createCanvas(canvasSizeStore.width || 480, canvasSizeStore.height || 400);
			// p.frameRate(30);
			p.background(colors.background);

			const scene = { canvasSize };
			await setup(p, colors, scene);
		};

		p.draw = () => {
			if (typeof window === "undefined") return;
			const scene = { canvasSize };
			draw(p, colors, scene);
		};
	};
};
