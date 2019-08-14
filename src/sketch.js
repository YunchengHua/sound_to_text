let mic, fft;
let points = [];
let font;
let words = "ASMR"
let pos;
let shift_pos;
let shift_vel;
let cur_color;
let target_color;
let clevel = 0;
let particles = []

function preload() {
  font = loadFont("tt.ttf");
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  //let c = createCanvas(1080, 720);
  //c.position(windowWidth / 2 - width / 2, windowHeight / 2 - height / 2);

  noFill();

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  let font_size = 400
  let bbox = font.textBounds(words, 10, 30, font_size);
  colorMode(HSB, 360, 100, 100, 100)

  textFont(font)
  pos = createVector();
  pos.x = -bbox.w / 2
  pos.y = bbox.h / 3

  shift_pos = createVector(width / 2, height / 2)
  shift_vel = createVector(0, 0)

  cur_color = color(random(360), 100, 100)
  target_color = color(random(360), 100, 100)

  points = font.textToPoints(words, pos.x, pos.y, font_size, {
    sampleFactor: 0.1
  });
  console.log(points.length)
}

function draw() {
  background(0);
  push()
  let spectrum = fft.analyze();
  let level = mic.getLevel();
  let limit = 0.8

  level = map(level, 0, 1, 0.6, 3);
  clevel += (level - clevel) / 20;

  if (shift_pos.x < -pos.x / 1.6 || shift_pos.x > width + pos.x / 1.6) {
    shift_vel.x *= -1;
    target_color = color(random(360), 100, 100)
    for(let i = 0;i < 10;i ++){
      particles.push(new Particle(shift_pos.x,shift_pos.y,0))
    }
  }
  if (shift_pos.y < pos.y * 1.2 || shift_pos.y > height - pos.y / 1.5) {
    shift_vel.y *= -1;
    target_color = color(random(360), 100, 100)
    for(let i = 0;i < 10;i ++){
      particles.push(new Particle(shift_pos.x,shift_pos.y,0))
    }
  }
  shift_pos.add(shift_vel)

  if (level > limit && dist(shift_vel.x, shift_vel.y, 0, 0) < 8) {
    if (dist(shift_vel.x, shift_vel.y, 0, 0) < 2) {
      let a = random(TWO_PI)
      shift_vel.x = cos(a)
      shift_vel.y = sin(a)
    }
    shift_vel.mult(2)
  } else {
    shift_vel.mult(0.99)
    if (dist(shift_vel.x, shift_vel.y, 0, 0) < 0.5) {
      shift_vel = createVector(0, 0);
    }
  }

  translate(shift_pos.x, shift_pos.y)
  scale(clevel);

  cur_color = lerpColor(cur_color, target_color, 0.05)
  strokeWeight(8);
  for (let i = 0; i < points.length; i += 1) {
    stroke(cur_color)

    let l = spectrum[i] / 12;
    let x = points[i].x;
    let y = points[i].y;
    let a = PI * (points[i].alpha + 90) / 180;

    line(x - l * cos(a), y - l * sin(a), x + l * cos(a), y + l * sin(a));
  }

  fill(cur_color)
  textSize(400)
  text(words, pos.x, pos.y)

  pop()

  for (let i = 0; i < particles.length; i++) {
    particles[i].show()
    if (particles[i].dead)
      particles.splice(i, 1)
  }
}

function Particle(x, y, c) {
  this.loc = createVector(x, y)
  this.c = random(360)
  let a = random(TWO_PI)
  this.vel = createVector(cos(a), sin(a))
  this.vel.mult(random(10, 20))
  this.s = random(50, 100)
  this.dead = false

  this.show = function() {
    if (this.loc.x < 0 || this.loc.x > width) {
      this.vel.x *= -1;
    }
    if (this.loc.y < 0 || this.loc.y > height) {
      this.vel.y *= -1;
    }
    this.loc.add(this.vel)
    this.vel.mult(0.95)

    let a = map(dist(0, 0, this.vel.x, this.vel.y), 0, 20, 0, 100)
    fill(this.c, 100, 100, a)
    textSize(this.s)
    text(words, this.loc.x, this.loc.y)

    if (dist(0, 0, this.vel.x, this.vel.y) < 1)
      this.dead = true
  }
}
