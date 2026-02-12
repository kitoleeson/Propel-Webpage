let canvas;

function setup() {
  canvas = createCanvas(400, 400);
  noLoop(); // important for consistent high-res exports
  drawSketch();

  // hook up the download button
  const btn = document.getElementById('download-btn');
  btn.addEventListener('click', saveHighRes);
}

let colours = {
  white: "#ffffff",
  teal: "#1eb9c2",
};

let theta = 0;
let radius = 0;
let size = 312;

const logoPoint = (theta) => {
  radius = Math.pow(Math.cos((3/7) * theta), 2);
  return { x: width/2 + radius * size * Math.cos(theta), y: height/2 + radius * size * Math.sin(theta) };
}

function drawSketch() {
  background(colours.white);
  stroke(colours.teal);
  strokeWeight(6);

  const bounds = (a, b) => (Math.PI / 6) * (3 + (8 * a) + (14 * b));
  for (let k = 0; k < 6; k++) for (let t = bounds(0, k); t < bounds(1, k); t += 0.005) {
    const point = logoPoint(t);
    ellipse(point.x, point.y, 4);
  }
}

function draw() {}

function saveHighRes() {
  const input = document.getElementById('filename');
  const filename = input.value.trim() || 'my-sketch';

  const currentDensity = pixelDensity();

  pixelDensity(3);

  redraw();
  drawSketch();

  saveCanvas(canvas, filename, 'png');

  pixelDensity(currentDensity);
  redraw();
  drawSketch();
}