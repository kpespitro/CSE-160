// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
  `;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform float u_texColorWeight;
  void main(){
    vec4 baseColor = u_FragColor;
    vec4 texColor;

    if (u_whichTexture == -1) {
      texColor = vec4(v_UV, 1.0, 1.0); 
    } else if (u_whichTexture == 0) { 
      texColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      texColor = texture2D(u_Sampler1, v_UV);
    } else {
      texColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
    
    gl_FragColor = (1.0 - u_texColorWeight) * baseColor + u_texColorWeight * texColor;
  }
  `;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0; // sky
let u_Sampler1; // dirt
let u_whichTexture;
let u_texColorWeight;

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

  // get storage location a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // get storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (u_Sampler1 < 0) {
    console.log('Failed to get the storage location of u_Sampler!');
    return false;
  }

  // get storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (u_whichTexture < 0) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // storage location for u_texColorWeight
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (u_texColorWeight < 0) {
    console.log('Failed to get the storage location of u_texColorWeight');
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
let g_fps = 0;
let g_lastFrameTime = performance.now();
let g_camera;
let g_lastMouseX = null;
let g_lastMouseY = null;
let g_mouseDown = false;
let g_blockEditMode = false;
let g_animalX = 14;
let g_animalZ = 14;
let g_animalAngle = 0;
let g_animalMoveTimer = 0;
let g_gameWon = false;

function addActionsForHtmlUI(){
  // button events
  // document.getElementById('animationOffButton').onclick = function() {g_animation=false;};
  // document.getElementById('animationOnButton').onclick = function() {g_animation=true;};

  // move camera
  // document.getElementById('angleSlide').addEventListener('mousemove', function() { gAnimalGlobalRotation = this.value; renderScene(); });

  // body movements
  // document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderScene(); });

  // document.getElementById('leftEarSlide').addEventListener('mousemove', function() { g_leftEarAngle = this.value; renderScene(); });
  // document.getElementById('rightEarSlide').addEventListener('mousemove', function() { g_rightEarAngle = this.value; renderScene(); });

  // document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() { g_frontLeftLegAngle = this.value; renderScene(); });
  // document.getElementById('frontLeftFootSlide').addEventListener('mousemove', function() { g_frontLeftFootAngle = this.value; renderScene(); });
  // document.getElementById('frontLeftPawSlide').addEventListener('mousemove', function() { g_frontLeftPawAngle = this.value; renderScene(); });

  // document.getElementById('frontRightLegSlide').addEventListener('mousemove', function() { g_frontRightLegAngle = this.value; renderScene(); });
  // document.getElementById('frontRightFootSlide').addEventListener('mousemove', function() { g_frontRightFootAngle = this.value; renderScene(); });
  // document.getElementById('frontRightPawSlide').addEventListener('mousemove', function() { g_frontRightPawAngle = this.value; renderScene(); });

  // document.getElementById('backLeftLegSlide').addEventListener('mousemove', function() { g_backLeftLegAngle = this.value; renderScene(); });
  // document.getElementById('backLeftFootSlide').addEventListener('mousemove', function() { g_backLeftFootAngle = this.value; renderScene(); });
  // document.getElementById('backLeftPawSlide').addEventListener('mousemove', function() { g_backLeftPawAngle = this.value; renderScene(); });

  // document.getElementById('backRightLegSlide').addEventListener('mousemove', function() { g_backRightLegAngle = this.value; renderScene(); });
  // document.getElementById('backRightFootSlide').addEventListener('mousemove', function() { g_backRightFootAngle = this.value; renderScene(); });
  // document.getElementById('backRightPawSlide').addEventListener('mousemove', function() { g_backRightPawAngle = this.value; renderScene(); });
}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the sky image object');
    return false;
  }
  image0.onload = function(){ sendTextureToTEXTURE0( image0); };
  image0.src = 'sky.jpg';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the dirt image object');
    return false;
  }
  image1.onload = function(){ sendTextureToTEXTURE1( image1); };
  image1.src = 'floor.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler0, 0);

  //gl.clear(gl.COLOR_BUFFER_BIT);

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  console.log('finished sky texture');
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler1, 1);

  console.log('finished floor texture');
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  initCubeBuffer();
  initCylinderBuffer();

  addActionsForHtmlUI();

  g_camera = new Camera();

  document.onkeydown = function(ev) { keydown(ev); };

  canvas.onmousedown = function(ev) {
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;

    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    // left/right
    if (dx != 0) {
      g_camera.panLeft(dx * 0.3);
    }

    // up/down
    if (dy != 0) {
      g_camera.panUp(-dy * 0.3);
    }
  }

  initTextures();

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
  let now = performance.now();
  let deltaTime = now - g_lastFrameTime;
  g_lastFrameTime = now;

  if (deltaTime > 0) {
    let currentFPS = 1000 / deltaTime;
    g_fps = g_fps * 0.9 + currentFPS * 0.1;
  }

  g_seconds = now / 1000.0 - g_startTime;
  g_time = now / 1000.0;

  // update Animation angles
  updateAnimationAngles();

  updateAnimal();

  // draw everything
  renderScene();

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  g_leftEarAngle = 20 * Math.sin(g_time * 3);
  g_rightEarAngle = -20 * Math.sin(g_time * 3);
  g_frontLeftLegAngle = 30 * Math.sin(g_time * 5);
  g_frontRightLegAngle = -30 * Math.sin(g_time * 5);
  g_backLeftLegAngle = -30 * Math.sin(g_time * 5);
  g_backRightLegAngle = 30 * Math.sin(g_time * 5);
}

function updateAnimal() {
  if (g_gameWon) return;

  g_animalMoveTimer -= 1;
  if (g_animalMoveTimer > 0) return;
  g_animalMoveTimer = 60;

  let dirs = [
    [1, 0, 0],
    [-1, 0, 180],
    [0, 1, 270],
    [0, -1, 90],
  ];

  for (let i = dirs.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }

  for (let d of dirs) {
    let nx = g_animalX + d[0];
    let nz = g_animalZ + d[1];
    if (nx >= 0 && nx < 32 && nz >= 0 && nz < 32 && g_map[nx][nz] === 0) {
      g_animalX = nx;
      g_animalZ = nz;
      g_animalAngle = d[2];
      break;
    }
  }

  let ex = g_camera.eye.elements[0];
  let ez = g_camera.eye.elements[2];
  let dx = g_animalX - ex;
  let dz = g_animalZ - ez;
  if (Math.sqrt(dx*dx + dz*dz) < 1.5) {
    g_gameWon = true;
    console.log('You caught the bunny!');
  }
}

function getBlockInFront() {
  let e = g_camera.eye.elements;
  let a = g_camera.at.elements;

  let fx = a[0] - e[0];
  let fz = a[2] - e[2];

  let len = Math.sqrt(fx*fx + fz*fz);
  fx /= len;
  fz /= len;

  let bx = Math.floor(e[0] + fx * 1.5);
  let bz = Math.floor(e[2] + fz * 1.5);

  bx = Math.max(0, Math.min(31, bx));
  bz = Math.max(0, Math.min(31, bz));

  return [bx, bz];
}

function keydown(ev) {
  switch(ev.key) {
    case 'w': g_camera.moveForward(0.5);    break;
    case 's': g_camera.moveBackwards(0.5);  break;
    case 'a': g_camera.moveLeft(0.5);       break;
    case 'd': g_camera.moveRight(0.5);      break;
    case 'q': g_camera.panLeft(10);         break;
    case 'e': g_camera.panRight(10);        break;

    case 'Tab': {
      ev.preventDefault();
      g_blockEditMode = !g_blockEditMode;
      console.log('Edit mode: ' + g_blockEditMode);
      break;
    }

    case 'f': { // add
      if (!g_blockEditMode) break;
      let [bx, bz] = getBlockInFront();
      g_map[bx][bz] += 1;
      break;
    }

    case 'r': { // delete
      if (!g_blockEditMode) break;
      let [bx, bz] = getBlockInFront();
      if (g_map[bx][bz] > 0) {
        g_map[bx][bz] -= 1;
      }
      break;
    }
  }
}

var g_map = [
  [0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,2,2,0,0,0,0,2,2,2,0,0,0,0,0,2,2,2,0,0,0,0,2,2,0,0,0,0,0,3],
  [3,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,3],
  [3,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,2,2,2,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,2,2,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,2,0,0,2,2,2,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,2,0,0,0,3],
  [3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0],
];

function renderScene() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var startTime = performance.now();

  // projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

  // view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

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

  // sky
  var sky = new Cube();
  sky.color = [0.3, 0.5, 1.0, 1.0];
  sky.textureNum = 0;
  sky.texColorWeight = 0.7;
  sky.matrix.scale(1000, 1000, 1000);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // floor
  var floor = new Cube();
  floor.textureNum = 1;
  floor.texColorWeight = 1.0;
  floor.matrix.translate(0, -.75, 0.0);
  floor.matrix.scale(64, 0.01, 64);
  floor.matrix.translate(-.5, 0, -0.5);
  floor.render();

  // walls
  for (var x = 0; x < 32; x++) {
    for (var z = 0; z < 32; z++) {
      if (g_map[x][z] > 0) {
        var height = g_map[x][z];
        for (var y = 0; y < height; y++) {
          var wall = new Cube();
          wall.textureNum = 1;
          wall.texColorWeight = 1.0;
          wall.matrix.translate(x, -0.75 + y, z);
          wall.render();
        }
      }
    }
  }

  // body
  var body = new Cube();
  body.color = lightGray;
  body.textureNum=0;
  body.texColorWeight = 0.0;
  body.matrix.translate(g_animalX, -0.35, g_animalZ);
  body.matrix.rotate(g_animalAngle, 0, 1, 0);
  body.matrix.scale(0.4, 0.4, 0.75);
  body.render();
  var bodyMatrix = new Matrix4(body.matrix);

  // head
  var head = new Cube();
  head.color = white;
  head.textureNum=0;
  head.texColorWeight = 0.0;
  head.matrix = new Matrix4(bodyMatrix);
  head.matrix.translate(0.10, 1, -0.1);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.8, 0.6, 0.5);
  head.render();

  // eyes 
  var leftEye = new Cylinder();
  leftEye.color = [0, 0, 0, 1];
  leftEye.textureNum=0;
  leftEye.texColorWeight = 0.0;
  leftEye.matrix = new Matrix4(headMatrix);
  leftEye.matrix.translate(0.2, 0.4, 0.001);
  leftEye.matrix.scale(0.08, 0.08, 0.15);
  leftEye.render();

  var rightEye = new Cylinder();
  rightEye.color = [0, 0, 0, 1];
  rightEye.textureNum=0;
  rightEye.texColorWeight = 0.0
  rightEye.matrix = new Matrix4(headMatrix);
  rightEye.matrix.translate(0.6, 0.4, 0.001);
  rightEye.matrix.scale(0.08, 0.08, 0.15);
  rightEye.render();

  // left ear
  var leftEar = new Cube();
  leftEar.color = white;
  leftEar.textureNum=0;
  leftEar.texColorWeight = 0.0;
  leftEar.matrix = new Matrix4(headMatrix);
  leftEar.matrix.translate(0.1, 0.601, 0.3);
  leftEar.matrix.rotate(g_leftEarAngle, 1, 0, 0);
  leftEar.matrix.scale(0.2, 0.8, 0.2);
  leftEar.render();

  // right ear
  var rightEar = new Cube();
  rightEar.color = white;
  rightEar.textureNum=0;
  rightEar.texColorWeight = 0.0;
  rightEar.matrix = new Matrix4(headMatrix);
  rightEar.matrix.translate(0.6, 0.601, 0.3);
  rightEar.matrix.rotate(g_rightEarAngle, 1, 0, 0);
  rightEar.matrix.scale(0.2, 0.8, 0.2);
  rightEar.render();

  // tail
  var tail = new Cube();
  tail.color = white;
  tail.textureNum=0;
  tail.texColorWeight = 0.0;
  tail.matrix = new Matrix4(bodyMatrix);
  tail.matrix.translate(0.35, 0.8, 1.001);
  tail.matrix.scale(0.3, 0.2, 0.15);
  tail.render();

  var legColor = [0.9, 0.6, 0.6, 1.0];
  
  // front left leg
  var frontLeftLeg = new Cube();
  frontLeftLeg.color = midGray;
  frontLeftLeg.textureNum=0;
  frontLeftLeg.texColorWeight = 0.0;
  frontLeftLeg.matrix = new Matrix4(bodyMatrix);
  frontLeftLeg.matrix.translate(0, -0.4, 0);
  frontLeftLeg.matrix.rotate(g_frontLeftLegAngle, 1, 0, 0);
  var frontLeftLegMatrix = new Matrix4(frontLeftLeg.matrix);
  frontLeftLeg.matrix.scale(0.3, 0.4, 0.2);
  frontLeftLeg.render();

  var frontLeftFoot = new Cube();
  frontLeftFoot.color = lightGray;
  frontLeftFoot.textureNum=0;
  frontLeftFoot.texColorWeight = 0.0;
  frontLeftFoot.matrix = new Matrix4(frontLeftLegMatrix);
  frontLeftFoot.matrix.translate(0, -0.2, -0.05);
  frontLeftFoot.matrix.rotate(g_frontLeftFootAngle, 1, 0, 0);
  var frontLeftFootMatrix = new Matrix4(frontLeftFoot.matrix);
  frontLeftFoot.matrix.scale(0.4, 0.2, 0.2); 
  frontLeftFoot.render();

  var frontLeftPaw = new Cube();
  frontLeftPaw.color = darkGray;
  frontLeftPaw.textureNum=0;
  frontLeftPaw.texColorWeight = 0.0;
  frontLeftPaw.matrix = new Matrix4(frontLeftFootMatrix);
  frontLeftPaw.matrix.translate(0, 0, -0.2);
  frontLeftPaw.matrix.rotate(g_frontLeftPawAngle, 1, 0, 0);
  frontLeftPaw.matrix.scale(0.4, 0.2, 0.2);
  frontLeftPaw.render();

  // front right leg
  var frontRightLeg = new Cube();
  frontRightLeg.color = midGray;
  frontRightLeg.textureNum=0;
  frontRightLeg.texColorWeight = 0.0;
  frontRightLeg.matrix = new Matrix4(bodyMatrix);
  frontRightLeg.matrix.translate(0.7, -0.4, 0);
  frontRightLeg.matrix.rotate(g_frontRightLegAngle, 1, 0, 0);
  var frontRightLegMatrix = new Matrix4(frontRightLeg.matrix);
  frontRightLeg.matrix.scale(0.3, 0.4, 0.2);
  frontRightLeg.render();

  var frontRightFoot = new Cube();
  frontRightFoot.color = lightGray;
  frontRightFoot.textureNum=0;
  frontRightFoot.texColorWeight = 0.0;
  frontRightFoot.matrix = new Matrix4(frontRightLegMatrix);
  frontRightFoot.matrix.translate(-0.1, -0.2, -0.05);
  frontRightFoot.matrix.rotate(g_frontRightFootAngle, 1, 0, 0);
  var frontRightFootMatrix = new Matrix4(frontRightFoot.matrix);
  frontRightFoot.matrix.scale(0.4, 0.2, 0.2);
  frontRightFoot.render();

  var frontRightPaw = new Cube();
  frontRightPaw.color = darkGray;
  frontRightPaw.textureNum=0;
  frontRightPaw.texColorWeight = 0.0;
  frontRightPaw.matrix = new Matrix4(frontRightFootMatrix);
  frontRightPaw.matrix.translate(0, 0, -0.2);
  frontRightPaw.matrix.rotate(g_frontRightPawAngle, 1, 0, 0);
  frontRightPaw.matrix.scale(0.4, 0.2, 0.2);
  frontRightPaw.render();

  // back left leg
  var backLeftLeg = new Cube();
  backLeftLeg.color = midGray;
  backLeftLeg.textureNum=0;
  backLeftLeg.texColorWeight = 0.0;
  backLeftLeg.matrix = new Matrix4(bodyMatrix);
  backLeftLeg.matrix.translate(0, -0.4, 0.8); 
  backLeftLeg.matrix.rotate(g_backLeftLegAngle, 1, 0, 0);
  var backLeftLegMatrix = new Matrix4(backLeftLeg.matrix);
  backLeftLeg.matrix.scale(0.3, 0.4, 0.2); 
  backLeftLeg.render();

  var backLeftFoot = new Cube();
  backLeftFoot.color = lightGray;
  backLeftFoot.textureNum=0;
  backLeftFoot.texColorWeight = 0.0;
  backLeftFoot.matrix = new Matrix4(backLeftLegMatrix);
  backLeftFoot.matrix.translate(0, -0.2, -0.05);
  backLeftFoot.matrix.rotate(g_backLeftFootAngle, 1, 0, 0);
  var backLeftFootMatrix = new Matrix4(backLeftFoot.matrix);
  backLeftFoot.matrix.scale(0.4, 0.2, 0.2);
  backLeftFoot.render();

  var backLeftPaw = new Cube();
  backLeftPaw.color = darkGray;
  backLeftPaw.textureNum=0;
  backLeftPaw.texColorWeight = 0.0;
  backLeftPaw.matrix = new Matrix4(backLeftFootMatrix);
  backLeftPaw.matrix.translate(0, 0, -0.2);
  backLeftPaw.matrix.rotate(g_backLeftPawAngle, 1, 0, 0);
  backLeftPaw.matrix.scale(0.4, 0.2, 0.2); 
  backLeftPaw.render();

  // back right leg
  var backRightLeg = new Cube();
  backRightLeg.color = midGray;
  backRightLeg.textureNum=0;
  backRightLeg.texColorWeight = 0.0;
  backRightLeg.matrix = new Matrix4(bodyMatrix);
  backRightLeg.matrix.translate(0.7, -0.4, 0.8);
  backRightLeg.matrix.rotate(g_backRightLegAngle, 1, 0, 0);
  var backRightLegMatrix = new Matrix4(backRightLeg.matrix);
  backRightLeg.matrix.scale(0.3, 0.4, 0.2);
  backRightLeg.render();

  var backRightFoot = new Cube();
  backRightFoot.color = lightGray;
  backRightFoot.textureNum=0;
  backRightFoot.texColorWeight = 0.0;
  backRightFoot.matrix = new Matrix4(backRightLegMatrix);
  backRightFoot.matrix.translate(-0.1, -0.2, -0.05);
  backRightFoot.matrix.rotate(g_backRightFootAngle, 1, 0, 0);
  var backRightFootMatrix = new Matrix4(backRightFoot.matrix);
  backRightFoot.matrix.scale(0.4, 0.2, 0.2);
  backRightFoot.render();

  var backRightPaw = new Cube();
  backRightPaw.color = darkGray;
  backRightPaw.textureNum=0;
  backRightPaw.texColorWeight = 0.0;
  backRightPaw.matrix = new Matrix4(backRightFootMatrix);
  backRightPaw.matrix.translate(0, 0, -0.2);
  backRightPaw.matrix.rotate(g_backRightPawAngle, 1, 0, 0);
  backRightPaw.matrix.scale(0.4, 0.2, 0.2);
  backRightPaw.render();
 
  if (g_blockEditMode) {
    let [hx, hz] = getBlockInFront();
    let highlightHeight = g_map[hx][hz];
    var highlight = new Cube();
    highlight.color = [1.0, 0.0, 0.0, 1.0]; 
    highlight.textureNum = 0;
    highlight.texColorWeight = 0.0;
    highlight.matrix.translate(hx, -0.75 + highlightHeight, hz);
    highlight.matrix.scale(1.05, 1.05, 1.05);
    highlight.render();
  }

  gl.flush();
  var renderMs = performance.now() - startTime;
  sendTextToHTML(
    "fps: " + g_fps.toFixed(1) + " | render: " + renderMs.toFixed(2) + "ms" +
    " | mode: " + (g_blockEditMode ? "EDIT" : "EXPLORE") + 
    (g_gameWon ? " | YOU CAUGHT THE BUNNY! " : " | Catch the bunny!"), 
    "numdot"
  );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}