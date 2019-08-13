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
  textSize(font_size)
  textFont(font)
  pos = createVector();
  pos.x = -bbox.w / 2
  pos.y = bbox.h / 3

  shift_pos = createVector(width/2,height/2)
  shift_vel = createVector(0,0)
  cur_color = color(255,255,255)
  target_color = color(255,255,255)

  points = font.textToPoints(words, pos.x, pos.y, font_size, {
    sampleFactor: 0.1
  });
  console.log(points.length)
}

function draw() {
  background(0);
  let spectrum = fft.analyze();
  let level = mic.getLevel();
  level = map(level, 0, 1, 0.6, 3);
  clevel += (level - clevel) / 20;

  let limit = 0.8
  console.log(level)
  if(level > limit && dist(shift_vel.x,shift_vel.y,0,0) < 8){
    if(shift_vel.x == 0 && shift_vel.y == 0){
      let a = random(TWO_PI)
      shift_vel.x = cos(a)
      shift_vel.y = sin(a)
    }
    shift_vel.mult(2)
  }else{
    shift_vel.mult(0.99)
    if(dist(shift_vel.x,shift_vel.y,0,0) < 1){
      shift_vel = createVector(0,0);
    }
  }

  if(shift_pos.x < -pos.x/1.6 || shift_pos.x > width+pos.x/1.6){
    shift_vel.x *= -1;
    target_color = color(random(255),random(255),random(255))
  }
  if(shift_pos.y < pos.y*1.2 || shift_pos.y > height-pos.y/1.5){
    shift_vel.y *= -1;
    target_color = color(random(255),random(255),random(255))
  }
  shift_pos.add(shift_vel)
  translate(shift_pos.x, shift_pos.y)
  scale(clevel);


  cur_color = lerpColor(cur_color,target_color,0.05)
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
  text(words, pos.x, pos.y)
}
