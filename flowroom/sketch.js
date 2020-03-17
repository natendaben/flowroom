/*
Flow Room
A Project by Elsa Roeber & Nate Bennett
ATLAS Institute, 2020

Serial Port Interface adapted from Arielle Hein, adapted from ITP Phys Comp Serial Labs
*/


//Variables for sounds
let beach;
let desert;
let forest;
let thunderstorm;
let underwater;

var serial;
var portName = '/dev/tty.usbmodem14101';
var incoming;
var data;
var previous = 0;
var delayInSeconds = 3;
var delayInMillis = 3000;
var colorMode = 3; // number between 1 - 5
var visualizationOn = false;
var active = true;

////// COLOR STUFF
var R1, G1, B1;
var R2, G2, B2;
var R3, G3, B3;
var R4, G4, B4;
var colorMode = 3; // must be a value between 1 - 5

if(colorMode == 1){ // desert
  R1 = 194;
  G1 = 91;
  B1 = 59;
  R2 = 223;
  G2 = 197;
  B2 = 158;
  R3 = 234;
  G3 = 157;
  B3 = 86;
  R4 = 141;
  G4 = 125;
  B4 = 154;
} else if(colorMode == 2){ // beach
  R1 = 117;
  G1 = 192;
  B1 = 220;
  R2 = 181;
  G2 = 226;
  B2 = 216;
  R3 = 150;
  G3 = 183;
  B3 = 172;
  R4 = 128;
  G4 = 202;
  B4 = 196;
} else if(colorMode == 3){ // ocean
  R1 = 18;
  G1 = 55;
  B1 = 80;
  R2 = 189;
  G2 = 203;
  B2 = 212;
  R3 = 76;
  G3 = 132;
  B3 = 165;
  R4 = 135;
  G4 = 206;
  B4 = 235;
} else if(colorMode == 4){ // rain
  R1 = 61;
  G1 = 86;
  B1 = 114;
  R2 = 196;
  G2 = 220;
  B2 = 238;
  R3 = 88;
  G3 = 117;
  B3 = 151;
  R4 = 149;
  G4 = 181;
  B4 = 202;
} else if(colorMode == 5){ // forest
  R1 = 50;
  G1 = 85;
  B1 = 38;
  R2 = 228;
  G2 = 231;
  B2 = 202;
  R3 = 128;
  G3 = 135;
  B3 = 70;
  R4 = 72;
  G4 = 127;
  B4 = 109;
}


////// VARIABLES
// for golden spiral circles
var number;
var radius = 4;
var stepSize = 0.5;
var opacity = 70;
var animate = true;
var time = 0;

// for sticks
var NUM_LINES = 20;
var t = 0;

// for flow field
var inc = 0.1
var scl = 15;
var columns;
var rows;
var zoff = 0;
var fr;
var particle = [];
var particle2 = [];
var particle3 = [];
var flowField;

// for mandala
var angle;
var gen = 80;

function preload() {
  //SET UP MP3s
  beach = loadSound('assets/beach.mp3');
  beach.playMode('restart');
  beach.setVolume(0);
  beach.setLoop(true);
  desert = loadSound('assets/desert.mp3');
  desert.playMode("restart");
  desert.setVolume(0);
  desert.setLoop(true);
  forest = loadSound('assets/forest.mp3');
  forest.playMode('restart');
  forest.setVolume(0);
  forest.setLoop(true);
  thunderstorm = loadSound('assets/thunderstorm.mp3');
  thunderstorm.playMode('restart');
  thunderstorm.setVolume(0);
  thunderstorm.setLoop(true);
  underwater = loadSound('assets/underwater.mp3');
  underwater.playMode('restart');
  underwater.setVolume(0);
  underwater.setLoop(true);
  bowls = loadSound('assets/bowls.mp3');
  bowls.playMode('untilDone');
  bowls.setLoop(true);
  bowls.setVolume(0);
}

function setup() {
  //P5 VISUALIZATION
  // createCanvas(800, 600);
  createCanvas(windowWidth, windowHeight);
 // background(0);
  columns = floor(width / scl);
  rows = floor(height / scl);
  fr = createP('');
  
  flowField = new Array(columns * rows);
  
  for(var i = 0; i < 800; i++){
     particle[i] = new Particle();
     particle2[i] = new Particle();
     particle3[i] = new Particle();
  }
  
  frameRate(30); // 30 fps --> 1800 fpm

  //SERIAL STUFF
  serial = new p5.SerialPort(); //a new instance of serial port library

  //set up events for serial communication
  serial.on('connected', serverConnected);
  serial.on('open', portOpen);
  serial.on('data', serialEvent);
  serial.on('error', serialError);
  serial.on('close', portClose);

  //open our serial port
  serial.open(portName);

  //let's figure out what port we're on - useful for determining your port
  // serial.on('list', printList); //set a callback function for the serialport list event
  // serial.list(); //list the serial ports
  
}

function serverConnected(){
	console.log('connected to the server');
}

function portOpen(){
  console.log('the serial port opened!');
}


function serialEvent(){
  var inString = serial.readLine(); 

  if(inString.length > 0){ //if something exists
    console.log(inString);
    incoming = inString;
  }
  
}
function draw(){
  //print(frameCount);
  // minute one
  if(frameCount < 1800){
    background(R1, G1, B1);
    flow();
    flower(width/2, height/2, 1);
    fill(R1, G1, B1, 255-frameCount);
    rect(0, 0, width, height);
      if(frameCount > 940){
            newPattern();
      }
  }
  // minute two
  if(frameCount > 1800 && frameCount < 3600){
    flow();
    flower(width/2, height/2, 1);
    if(frameCount > 2400){
      flower(width/8, height/2, 0.2);
      
      flower(3*width/8, height/2, 0.4);
      flower(width/2, height/2, 0.5);
      flower(5*width/8, height/2, 0.4);
      
      flower(7*width/8, height/2, 0.2);
    }
    if(frameCount > 3000){
      flower(width/4, height/2, 0.3);
      flower(3*width/4, height/2, 0.3);
      shrinkFlower();
    }
  }
  // minute three
  if(frameCount > 3600 && frameCount < 5400){
    // background(R1, B1, G1);

    flower(width/2, height/2, 1);
    flow();
    if(frameCount > 4000){
      flower(width/4, height/2, 0.5);
      flower(3*width/4, height/2, 0.5);
      if(frameCount > 4000 && frameCount < 4800){
        newPattern();
      }
      
    }
    if(frameCount > 4800 && frameCount < 5400){
      shrinkFlower();
    }
  }
  // minute four
  if(frameCount > 5400 && frameCount < 7120){
   // background(R1, G1, B1); 
     flower(width/2, height/2, 1);
     flower(width/8, height/2, 0.4);
     flower(width/4, height/2, 0.4);
     flower(3*width/8, height/2, 0.5);
     flower(width/2, height/2, 0.5);
     flower(5*width/8, height/2, 0.5);
     flower(3*width/4, height/2, 0.4);
     flower(7*width/8, height/2, 0.5);
     shrinkFlower();
    if(frameCount > 5700){
     flower(width/2, height/2, 1);
     flower(width/4, height/2, 0.4);
     flower(3*width/8, height/2, 0.5);
     flower(width/2, height/2, 0.5);
     flower(5*width/8, height/2, 0.5);
     flower(3*width/4, height/2, 0.4);
    }
    if(frameCount > 6000){
     flower(width/2, height/2, 1);
     flower(3*width/8, height/2, 0.5);
     flower(width/2, height/2, 0.5);
     flower(5*width/8, height/2, 0.5);
    }
    if(frameCount > 6300){
     flower(width/2, height/2, 1);
     flower(width/2, height/2, 0.5);
    }
    if(frameCount > 6600){
     flower(width/2, height/2, 1);
     flower(width/2, height/2, 0.5);
     shrinkFlower();
    }
  }
  // minute five // bad transition!
  if(frameCount > 7120 && frameCount < 9000){
    background(R1, G1, B1);
    flow();
    flower(width/2, height/2, 1);
    if(frameCount > 8100){
      shrinkFlower();
    }
  }
  if(frameCount > 8745){
    // noLoop();
    fill(R1, G1, B1, -8745+frameCount);
    rect(0, 0, width, height);

  }
  if(frameCount == 9000){
    noLoop();
  }

  data = incoming;
  if (data != previous) 
  {
    sound();  
    // console.log("something new");
    if(visualizationOn){
      if(colorMode == 1){ // desert
        R1 = 194;
        G1 = 91;
        B1 = 59;
        R2 = 223;
        G2 = 197;
        B2 = 158;
        R3 = 234;
        G3 = 157;
        B3 = 86;
        R4 = 141;
        G4 = 125;
        B4 = 154;
      } else if(colorMode == 2){ // beach
        R1 = 117;
        G1 = 192;
        B1 = 220;
        R2 = 181;
        G2 = 226;
        B2 = 216;
        R3 = 150;
        G3 = 183;
        B3 = 172;
        R4 = 128;
        G4 = 202;
        B4 = 196;
      } else if(colorMode == 3){ // ocean
        R1 = 18;
        G1 = 55;
        B1 = 80;
        R2 = 189;
        G2 = 203;
        B2 = 212;
        R3 = 76;
        G3 = 132;
        B3 = 165;
        R4 = 135;
        G4 = 206;
        B4 = 235;
      } else if(colorMode == 4){ // rain
        R1 = 61;
        G1 = 86;
        B1 = 114;
        R2 = 196;
        G2 = 220;
        B2 = 238;
        R3 = 88;
        G3 = 117;
        B3 = 151;
        R4 = 149;
        G4 = 181;
        B4 = 202;
      } else if(colorMode == 5){ // forest
        R1 = 50;
        G1 = 85;
        B1 = 38;
        R2 = 228;
        G2 = 231;
        B2 = 202;
        R3 = 128;
        G3 = 135;
        B3 = 70;
        R4 = 72;
        G4 = 127;
        B4 = 109;
      }
    } else { //visualization off
      // R1 = 0;
      // G1 = 0;
      // B1 = 0;
      // R2 = 0;
      // G2 = 0;
      // B2 = 0;
      // R3 = 0;
      // G3 = 0;
      // B3 = 0;
      // R4 = 0;
      // G4 = 0;
      // B4 = 0;
    }
  }
  previous = data;
}


function sound(){

  if(previous == "A"){
    beach.setVolume(0, delayInSeconds);
    console.log("Fading beach down");
    window.setTimeout(()=>{beach.stop(); console.log("beach off");}, delayInMillis);
  } else if(previous == "B"){
    desert.setVolume(0, delayInSeconds);
    console.log("Fading desert down");
    window.setTimeout(()=>{desert.stop(); console.log("desert off");}, delayInMillis);
  } else if(previous == "C"){
    forest.setVolume(0, delayInSeconds);
    console.log("Fading forest down");
    window.setTimeout(()=>{forest.stop(); console.log("forest off");}, delayInMillis);
  } else if(previous == "D"){
    thunderstorm.setVolume(0, delayInSeconds);
    console.log("Fading thunderstorm down");
    window.setTimeout(()=>{thunderstorm.stop(); console.log("thunderstorm off");}, delayInMillis);
  } else if(previous == "E"){
    underwater.setVolume(0, delayInSeconds);
    console.log("Fading underwater down");
    window.setTimeout(()=>{underwater.stop(); console.log("underwater off");}, delayInMillis);
  }
  if(incoming == "A"){ //BEACH
    beach.setVolume(0);
    beach.play();
    beach.setVolume(.8, delayInSeconds);
    visualizationOn = true;
    // colorMode = 1;
    colorMode = 2;
  } else if(incoming == "B"){ //DESERT
    desert.setVolume(0);
    desert.play();
    desert.setVolume(.8, delayInSeconds);
    visualizationOn = true;
    // colorMode = 4;
    colorMode = 1;
  } else if(incoming == "C"){ //FOREST
    forest.setVolume(0);
    forest.play();
    forest.setVolume(.8, delayInSeconds);
    visualizationOn = true;
    colorMode = 5;
  } else if(incoming == "D"){ //THUNDERSTORM
    thunderstorm.setVolume(0);
    thunderstorm.play();
    thunderstorm.setVolume(.9, delayInSeconds);
    visualizationOn = true;
    // colorMode = 3;
    colorMode = 4;
  } else if(incoming == "E"){ //UNDERWATER
    underwater.setVolume(0);
    underwater.play();
    underwater.setVolume(1, delayInSeconds);
    visualizationOn = true;
    // colorMode = 2;
    colorMode = 3;
  } else if(incoming == "0"){
    // background(0,0,0);
    visualizationOn = false;
    console.log("Turn down signal received");
  } 
  if (visualizationOn){
    bowls.play();
    bowls.setVolume(.7, delayInSeconds);
    console.log("Bowls playing");
  } else {
    bowls.setVolume(0, delayInSeconds);
    console.log("Fading bowls down");
    window.setTimeout(()=>{bowls.stop(); console.log("bowls off");}, delayInMillis);
  }
}

function serialError(err){
  console.log('something went wrong with the port. ' + err);
}

function portClose(){
  console.log('the port was closed');
}

// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
 print(i + " " + portList[i]);
 }
}


///////// HELPER METHODS
// flowfield
function flow(){
  var yoff = 0;

  for(var y = 0; y < rows; y++){
    var xoff = 0;
    for(var x = 0; x < columns; x++){
      var index = x + y * columns;
      
      var angle = noise(xoff, yoff, zoff)*TWO_PI*2;
      
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowField[index] = v;
      xoff += inc;
    
    }
    yoff += inc;
    zoff += 0.0003;
  }
  
  for(var i = 0; i < particle.length; i++){
    particle[i].follow(flowField);
    particle[i].update();
    particle[i].show();
    particle[i].edges();
  }

  fr.html(floor(frameRate()));
    // print(frameCount);
  if(frameCount > 1000){
      for(var j = 0; j < particle2.length; j++){
        particle2[j].follow(flowField);
        particle2[j].update();
        particle2[j].show();
        particle2[j].edges();
      }
  }
  if(frameCount > 3600){
      for(var k = 0; k < particle3.length; k++){
        particle3[k].follow(flowField);
        particle3[k].update();
        particle3[k].show();
        particle3[k].edges();
      }
  }
}


// growing & shrinking mandala
function flower(originX, originY, newSize){
    strokeWeight(0.8);

    stroke(R2, G2, B2, 80);
    fill(R3, G3, B3, 10);
    if(frameCount > 3600){
      fill(R1, G1, B1, 2);
    }
    if(frameCount > 5000){ // bad fill??
      fill(R1, G1, B1, 2);
    }
  if(frameCount > 6300){
      fill(R4, G4, B4, 2);
    }
  
    angle = sin(gen*44)*44;
      push();
        translate(originX, originY);
        scale(newSize);
        rotate(gen*2);
        for(var i = 0; i < 144; i++){
          rotate(6 / gen*44);
          curve(i, i, 0, angle+i, 133, angle-i, i+133, i);
        }
      pop();

      gen += 0.00009;
}

function shrinkFlower(originX, originY){
    stroke(R1, G1, B1, 80);
    strokeWeight(0.8);
    fill(R3, G3, B3, 5);
  
    angle = sin(gen*44)*44;
   // background(angle*100, 100, 100);
      // scale(newSize);
      push();
       // translate(originX, originY);
        // scale(newSize);
        rotate(gen*2);
        for(var i = 0; i < 144; i++){
          scale(10/(i+1));
          rotate(6 / gen*44);
          curve(i, i, 0, angle+i, 133, angle-i, i+133, i);
        }
      pop();

      gen += 0.00009;
}

// golden spiral spinning circles
function newPattern(){
  fill(R2, G2, B2,opacity);
  if(frameCount > 4000){
    fill(R3, G3, B3, opacity/2);
  }
  noStroke();
  translate(width / 2, height / 2); // original translation
  if (animate == true){
    number = frameCount - 940;     
  }
  var goldenAngle = PI * (3.0 - sqrt(5));
  rotate(time);
  
  for (var i = 0; i < number; i++) {
  //  translate(-frameCount/10, i * stepSize);
    translate(0, i * stepSize/2);
    rotate(goldenAngle);
    // draw ellipse
    ellipse(0, 0, radius);
  }
  time += 0.005;
}

function Particle(){
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.maxspeed = 3;
  
  this.prevPos = this.pos.copy();
  
  this.update = function(){
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
  }
  
  this.follow = function(vectors){
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * columns;
    var force = vectors[index];
    this.applyForce(force);
  }
  
  this.applyForce = function(force){
    this.acc.add(force);
  }
  
  this.show = function(){
   stroke(255, 255, 255, 5);
    strokeWeight(1.5);
    //fill(58, 139, 159, 10)
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
   // point(this.pos.x, this.pos.y);
    this.updatePrev();
  }
  
  this.updatePrev = function(){
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
  }
  
  this.edges = function(){
    if(this.pos.x > width){
      this.pos.x = 0;
      this.updatePrev();
    }
    if(this.pos.x < 0){
      this.pos.x = width;
      this.updatePrev();
    }
    if(this.pos.y > height){
      this.pos.y = 0;
      this.updatePrev();
    }
    if(this.pos.x < 0){
      this.pos.y = height;
      this.updatePrev();
    }
  }
}