// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main(){
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
  `;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor; 
  void main(){
    gl_FragColor = u_FragColor;
  }
  `;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let gAnimalGlobalRotation=0;
let g_leftEarAngle = 0;
let g_rightEarAngle = 0;
let g_frontLeftLegAngle = 0;
let g_frontLeftFootAngle = 0;
let g_frontLeftPawAngle = 0;
let g_frontRightLegAngle = 0;
let g_frontRightFootAngle = 0;
let g_frontRightPawAngle = 0;
let g_backLeftLegAngle = 0;
let g_backLeftFootAngle = 0;
let g_backLeftPawAngle = 0;
let g_backRightLegAngle = 0;
let g_backRightFootAngle = 0;
let g_backRightPawAngle = 0;
let g_headAngle = 0;
let g_animation = false;
let g_time = 0;

function addActionsForHtmlUI(){
  // button events
  document.getElementById('animationOffButton').onclick = function() {g_animation=false;};
  document.getElementById('animationOnButton').onclick = function() {g_animation=true;};

  // move camera
  document.getElementById('angleSlide').addEventListener('mousemove', function() { gAnimalGlobalRotation = this.value; renderScene(); });

  // body movements
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderScene(); });

  document.getElementById('leftEarSlide').addEventListener('mousemove', function() { g_leftEarAngle = this.value; renderScene(); });
  document.getElementById('rightEarSlide').addEventListener('mousemove', function() { g_rightEarAngle = this.value; renderScene(); });

  document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() { g_frontLeftLegAngle = this.value; renderScene(); });
  document.getElementById('frontLeftFootSlide').addEventListener('mousemove', function() { g_frontLeftFootAngle = this.value; renderScene(); });
  document.getElementById('frontLeftPawSlide').addEventListener('mousemove', function() { g_frontLeftPawAngle = this.value; renderScene(); });

  document.getElementById('frontRightLegSlide').addEventListener('mousemove', function() { g_frontRightLegAngle = this.value; renderScene(); });
  document.getElementById('frontRightFootSlide').addEventListener('mousemove', function() { g_frontRightFootAngle = this.value; renderScene(); });
  document.getElementById('frontRightPawSlide').addEventListener('mousemove', function() { g_frontRightPawAngle = this.value; renderScene(); });

  document.getElementById('backLeftLegSlide').addEventListener('mousemove', function() { g_backLeftLegAngle = this.value; renderScene(); });
  document.getElementById('backLeftFootSlide').addEventListener('mousemove', function() { g_backLeftFootAngle = this.value; renderScene(); });
  document.getElementById('backLeftPawSlide').addEventListener('mousemove', function() { g_backLeftPawAngle = this.value; renderScene(); });

  document.getElementById('backRightLegSlide').addEventListener('mousemove', function() { g_backRightLegAngle = this.value; renderScene(); });
  document.getElementById('backRightFootSlide').addEventListener('mousemove', function() { g_backRightFootAngle = this.value; renderScene(); });
  document.getElementById('backRightPawSlide').addEventListener('mousemove', function() { g_backRightPawAngle = this.value; renderScene(); });
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  initCubeBuffer();
  initCylinderBuffer();

  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 1.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  //renderScene(); 

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_time = performance.now()/1000.0;

  // update Animation angles
  updateAnimationAngles();

  // draw everything
  renderScene();

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_leftEarAngle = 20 * Math.sin(g_time * 3);
    g_rightEarAngle = -20 * Math.sin(g_time * 3);

    g_frontLeftLegAngle = 30 * Math.sin(g_time * 5);
    g_frontRightLegAngle = -30 * Math.sin(g_time * 5);
    g_backLeftLegAngle = -30 * Math.sin(g_time * 5);
    g_backRightLegAngle = 30 * Math.sin(g_time * 5);
  }
 }

// draw a bunny!
function renderScene() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var startTime = performance.now();

  // pass matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4();
  globalRotMat.setRotate(gAnimalGlobalRotation, 0, 1, 0);
  // globalRotMat.rotate(180, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // colors
  const white = [1.0, 1.0, 1.0, 1.0];
  const lightGray = [0.85, 0.85, 0.85, 1.0];
  const midGray = [0.7, 0.7, 0.7, 1.0];
  const darkGray = [0.5, 0.5, 0.5, 1.0];
  // const earPink = [1.0, 0.75, 0.75, 1.0];

  // body
  var body = new Cube();
  body.color = lightGray;
  body.matrix.translate(-0.2, -0.5, -0.35);
  body.matrix.scale(0.4, 0.4, 0.75);
  body.render();
  var bodyMatrix = new Matrix4(body.matrix);

  // head
  var head = new Cube();
  head.color = white;
  head.matrix = new Matrix4(bodyMatrix);
  head.matrix.translate(0.10, 1, -0.1);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.8, 0.6, 0.5);
  head.render();

  // eyes 
  var leftEye = new Cylinder();
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix = new Matrix4(headMatrix);
  leftEye.matrix.translate(0.2, 0.4, 0.001);
  leftEye.matrix.scale(0.08, 0.08, 0.15);
  leftEye.render();

  var rightEye = new Cylinder();
  rightEye.color = [0, 0, 0, 1];
  rightEye.matrix = new Matrix4(headMatrix);
  rightEye.matrix.translate(0.6, 0.4, 0.001);
  rightEye.matrix.scale(0.08, 0.08, 0.15);
  rightEye.render();

  // left ear
  var leftEar = new Cube();
  leftEar.color = white;
  leftEar.matrix = new Matrix4(headMatrix);
  leftEar.matrix.translate(0.1, 0.601, 0.3);
  leftEar.matrix.rotate(g_leftEarAngle, 1, 0, 0);
  leftEar.matrix.scale(0.2, 0.8, 0.2);
  leftEar.render();

  // right ear
  var rightEar = new Cube();
  rightEar.color = white;
  rightEar.matrix = new Matrix4(headMatrix);
  rightEar.matrix.translate(0.6, 0.601, 0.3);
  rightEar.matrix.rotate(g_rightEarAngle, 1, 0, 0);
  rightEar.matrix.scale(0.2, 0.8, 0.2);
  rightEar.render();

  // tail
  var tail = new Cube();
  tail.color = white;
  tail.matrix = new Matrix4(bodyMatrix);
  tail.matrix.translate(0.35, 0.8, 1.001);
  tail.matrix.scale(0.3, 0.2, 0.15);
  tail.render();

  var legColor = [0.9, 0.6, 0.6, 1.0];
  
  // front left leg
  var frontLeftLeg = new Cube();
  frontLeftLeg.color = midGray;
  frontLeftLeg.matrix = new Matrix4(bodyMatrix);
  frontLeftLeg.matrix.translate(0, -0.4, 0);
  frontLeftLeg.matrix.rotate(g_frontLeftLegAngle, 1, 0, 0);
  var frontLeftLegMatrix = new Matrix4(frontLeftLeg.matrix);
  frontLeftLeg.matrix.scale(0.3, 0.4, 0.2);
  frontLeftLeg.render();

  var frontLeftFoot = new Cube();
  frontLeftFoot.color = lightGray;
  frontLeftFoot.matrix = new Matrix4(frontLeftLegMatrix);
  frontLeftFoot.matrix.translate(0, -0.2, -0.05);
  frontLeftFoot.matrix.rotate(g_frontLeftFootAngle, 1, 0, 0);
  var frontLeftFootMatrix = new Matrix4(frontLeftFoot.matrix);
  frontLeftFoot.matrix.scale(0.4, 0.2, 0.2); 
  frontLeftFoot.render();

  var frontLeftPaw = new Cube();
  frontLeftPaw.color = darkGray;
  frontLeftPaw.matrix = new Matrix4(frontLeftFootMatrix);
  frontLeftPaw.matrix.translate(0, 0, -0.2);
  frontLeftPaw.matrix.rotate(g_frontLeftPawAngle, 1, 0, 0);
  frontLeftPaw.matrix.scale(0.4, 0.2, 0.2);
  frontLeftPaw.render();

  // front right leg
  var frontRightLeg = new Cube();
  frontRightLeg.color = midGray;
  frontRightLeg.matrix = new Matrix4(bodyMatrix);
  frontRightLeg.matrix.translate(0.7, -0.4, 0);
  frontRightLeg.matrix.rotate(g_frontRightLegAngle, 1, 0, 0);
  var frontRightLegMatrix = new Matrix4(frontRightLeg.matrix);
  frontRightLeg.matrix.scale(0.3, 0.4, 0.2);
  frontRightLeg.render();

  var frontRightFoot = new Cube();
  frontRightFoot.color = lightGray;
  frontRightFoot.matrix = new Matrix4(frontRightLegMatrix);
  frontRightFoot.matrix.translate(-0.1, -0.2, -0.05);
  frontRightFoot.matrix.rotate(g_frontRightFootAngle, 1, 0, 0);
  var frontRightFootMatrix = new Matrix4(frontRightFoot.matrix);
  frontRightFoot.matrix.scale(0.4, 0.2, 0.2);
  frontRightFoot.render();

  var frontRightPaw = new Cube();
  frontRightPaw.color = darkGray;
  frontRightPaw.matrix = new Matrix4(frontRightFootMatrix);
  frontRightPaw.matrix.translate(0, 0, -0.2);
  frontRightPaw.matrix.rotate(g_frontRightPawAngle, 1, 0, 0);
  frontRightPaw.matrix.scale(0.4, 0.2, 0.2);
  frontRightPaw.render();

  // back left leg
  var backLeftLeg = new Cube();
  backLeftLeg.color = midGray;
  backLeftLeg.matrix = new Matrix4(bodyMatrix);
  backLeftLeg.matrix.translate(0, -0.4, 0.8); 
  backLeftLeg.matrix.rotate(g_backLeftLegAngle, 1, 0, 0);
  var backLeftLegMatrix = new Matrix4(backLeftLeg.matrix);
  backLeftLeg.matrix.scale(0.3, 0.4, 0.2); 
  backLeftLeg.render();

  var backLeftFoot = new Cube();
  backLeftFoot.color = lightGray;
  backLeftFoot.matrix = new Matrix4(backLeftLegMatrix);
  backLeftFoot.matrix.translate(0, -0.2, -0.05);
  backLeftFoot.matrix.rotate(g_backLeftFootAngle, 1, 0, 0);
  var backLeftFootMatrix = new Matrix4(backLeftFoot.matrix);
  backLeftFoot.matrix.scale(0.4, 0.2, 0.2);
  backLeftFoot.render();

  var backLeftPaw = new Cube();
  backLeftPaw.color = darkGray;
  backLeftPaw.matrix = new Matrix4(backLeftFootMatrix);
  backLeftPaw.matrix.translate(0, 0, -0.2);
  backLeftPaw.matrix.rotate(g_backLeftPawAngle, 1, 0, 0);
  backLeftPaw.matrix.scale(0.4, 0.2, 0.2); 
  backLeftPaw.render();

  // back right leg
  var backRightLeg = new Cube();
  backRightLeg.color = midGray;
  backRightLeg.matrix = new Matrix4(bodyMatrix);
  backRightLeg.matrix.translate(0.7, -0.4, 0.8);
  backRightLeg.matrix.rotate(g_backRightLegAngle, 1, 0, 0);
  var backRightLegMatrix = new Matrix4(backRightLeg.matrix);
  backRightLeg.matrix.scale(0.3, 0.4, 0.2);
  backRightLeg.render();

  var backRightFoot = new Cube();
  backRightFoot.color = lightGray;
  backRightFoot.matrix = new Matrix4(backRightLegMatrix);
  backRightFoot.matrix.translate(-0.1, -0.2, -0.05);
  backRightFoot.matrix.rotate(g_backRightFootAngle, 1, 0, 0);
  var backRightFootMatrix = new Matrix4(backRightFoot.matrix);
  backRightFoot.matrix.scale(0.4, 0.2, 0.2);
  backRightFoot.render();

  var backRightPaw = new Cube();
  backRightPaw.color = darkGray;
  backRightPaw.matrix = new Matrix4(backRightFootMatrix);
  backRightPaw.matrix.translate(0, 0, -0.2);
  backRightPaw.matrix.rotate(g_backRightPawAngle, 1, 0, 0);
  backRightPaw.matrix.scale(0.4, 0.2, 0.2);
  backRightPaw.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}