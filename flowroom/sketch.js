/*
Flow Room
A Project by Elsa Roeber & Nate Bennett
ATLAS Institute, 2020

Serial Port Interface adapted from Arielle Hein, adapted from ITP Phys Comp Serial Labs
*/

let beach;
let desert;
let forest;
let thunderstorm;
let underwater;

var number;
var radius = 7;
var stepSize = 0.5;
var opacity = 200;
var time = 0;
var n = 2; // multiplier for the 1200 frames
var time = 0;
var backR;
var backG;
var backB;
var circleR;
var circleG;
var circleB;
// COLOR SETS
// ocean beach
var beachR1 = 75; // background
var beachG1 = 110;
var beachB1 = 159;
var beachR2 = 71; // circles
var beachG2 = 157;
var beachB2 = 184;

// ocean deep
var oceanR1 = 18; // background
var oceanG1 = 56;
var oceanB1 = 79;
var oceanR2 = 52; // circles
var oceanG2 = 99;
var oceanB2 = 109;

// rainstorm
var rainR1 = 49; // background
var rainG1 = 58;
var rainB1 = 77;
var rainR2 = 194; // circles
var rainG2 = 204;
var rainB2 = 197;

// desert
var desertR1 = 129; // background
var desertG1 = 99;
var desertB1 = 52;
var desertR2 = 131; // circles
var desertG2 = 57;
var desertB2 = 30;

// forest
var forestR1 = 31; // background
var forestG1 = 69;
var forestB1 = 45;
var forestR2 = 44; // circles
var forestG2 = 92;
var forestB2 = 72;

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
}

var serial;
var portName = '/dev/tty.usbmodem14101';
var incoming;
var data;
var previous = 0;
var delayInSeconds = 3;
var delayInMillis = 3000;
var colorMode = 3; // number between 1 - 5

function setup() {
  createCanvas(windowWidth, windowHeight);

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
                     
  noStroke(); 
  if(colorMode == 1){
    backR = beachR1;
    backG = beachG1;
    backB = beachB1;
    circleR = beachR2;
    circleG = beachG2;
    circleB = beachB2;
  }else if(colorMode == 2){
    backR = oceanR1;
    backG = oceanG1;
    backB = oceanB1;
    circleR = oceanR2;
    circleG = oceanG2;
    circleB = oceanB2;
  }else if(colorMode == 3){
    backR = rainR1;
    backG = rainG1;
    backB = rainB1;
    circleR = rainR2;
    circleG = rainG2;
    circleB = rainB2;
  }else if(colorMode == 4){
    backR = desertR1;
    backG = desertG1;
    backB = desertB1;
    circleR = desertR2;
    circleG = desertG2;
    circleB = desertB2;
  }else if(colorMode == 5){
    backR = forestR1;
    backG = forestG1;
    backB = forestB1;
    circleR = forestR2;
    circleG = forestG2;
    circleB = forestB2;
  }
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

function draw() {
  if(colorMode == 1){
    backR = beachR1;
    backG = beachG1;
    backB = beachB1;
    circleR = beachR2;
    circleG = beachG2;
    circleB = beachB2;
  }else if(colorMode == 2){
    backR = oceanR1;
    backG = oceanG1;
    backB = oceanB1;
    circleR = oceanR2;
    circleG = oceanG2;
    circleB = oceanB2;
  }else if(colorMode == 3){
    backR = rainR1;
    backG = rainG1;
    backB = rainB1;
    circleR = rainR2;
    circleG = rainG2;
    circleB = rainB2;
  }else if(colorMode == 4){
    backR = desertR1;
    backG = desertG1;
    backB = desertB1;
    circleR = desertR2;
    circleG = desertG2;
    circleB = desertB2;
  }else if(colorMode == 5){
    backR = forestR1;
    backG = forestG1;
    backB = forestB1;
    circleR = forestR2;
    circleG = forestG2;
    circleB = forestB2;
  }

  var smallFrames = frameCount/10;
  background(backR, backG, backB);
  fill(circleR, circleG, circleB,opacity);
  translate(width / 2, height / 2); // original translation
  number = frameCount;     
  if(frameCount > 0){
    newPattern(-smallFrames);
  }
  
  data = incoming;
  if (data != previous) 
  {
    sound();    
    // console.log("something new");
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
    beach.setVolume(1, delayInSeconds);
    colorMode = 1;
  } else if(incoming == "B"){ //DESERT
    desert.setVolume(0);
    desert.play();
    desert.setVolume(1, delayInSeconds);
    colorMode = 4;
  } else if(incoming == "C"){ //FOREST
    forest.setVolume(0);
    forest.play();
    forest.setVolume(1, delayInSeconds);
    colorMode = 5;
  } else if(incoming == "D"){ //THUNDERSTORM
    thunderstorm.setVolume(0);
    thunderstorm.play();
    thunderstorm.setVolume(1, delayInSeconds);
    colorMode = 3;
  } else if(incoming == "E"){ //UNDERWATER
    underwater.setVolume(0);
    underwater.play();
    underwater.setVolume(1, delayInSeconds);
    colorMode = 2;
  } else if(incoming == "0"){
    // background(0,0,0);
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

function newPattern(moveX){
  var goldenAngle = PI * (3.0 - sqrt(5));
  rotate(time);

  for (var i = 0; i < number; i++) {
    
    translate(moveX, i * stepSize);
    rotate(goldenAngle);
    // draw ellipse
    ellipse(0, 0, radius);
  }
  time += 0.005;
}