let mic, fft;
let points = [];
let font;
let words = "ASMR"
let pos;

function preload() {
  font = loadFont("tt.ttf");
}


function setup() {
  createCanvas(1024, 720);
  noFill();

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  let font_size = height / 2
  let bbox = font.textBounds(words, 10, 30, font_size);
  textSize(font_size)
  textFont(font)
  pos = createVector();
  pos.x = width / 2 - bbox.w / 2
  pos.y = height / 2 + bbox.h / 3

  points = font.textToPoints(words, pos.x,pos.y, font_size, {
    sampleFactor: 0.1
  });
  console.log(points.length)
}

function draw() {
  background(100);

  let spectrum = fft.analyze();
  let level = mic.getLevel();
  level = map(level, 0, 1, 0, 255);

  for (i = 0; i < spectrum.length; i++) {
    let h = map(spectrum[i], 0, 255, 0, height / 4);
    stroke(0, level);
    line(i, height / 2 + h, i, height / 2 - h);
  }

  for (let i = 0; i < points.length; i++) {
    stroke(255)
    let l = 10;
    let x = points[i].x;
    let y = points[i].y;
    let a = PI*(points[i].alpha+90)/180;
    line(x-l*cos(a), y-l*sin(a), x+l*cos(a), y+l*sin(a));
  }

  fill(255)
  text(words,pos.x,pos.y)
}
