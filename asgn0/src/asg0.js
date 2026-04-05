// Ken Jacob Pespitro
// kpespitr@ucsc.edu
// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

  // instantiate v1
  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, "red");
}

function drawVector(v, color){
  // get canvas
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }
  // rendering
  var ctx = canvas.getContext('2d');
  // center
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;
  // scale
  const scale = 20;
  // components w/ scale
  let x = v.elements[0] * scale;
  let y = v.elements[1] * scale;
  // draw
  ctx.beginPath();
  ctx.moveTo(originX, originY); // center
  ctx.lineTo(originX + x, originY - y);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function handleDrawEvent(){
  // get canvas
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }
  // rendering
  var ctx = canvas.getContext('2d');
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // fill color again
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
  // input values
  let x1 = parseFloat(document.getElementById("x1Input").value);
  let y1 = parseFloat(document.getElementById("y1Input").value);
  let x2 = parseFloat(document.getElementById("x2Input").value);
  let y2 = parseFloat(document.getElementById("y2Input").value);
  // create vectors
  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);
  // draw vector
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent(){
  // get canvas
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }
  // rendering
  var ctx = canvas.getContext('2d');
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // fill color again
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
  // input values
  let x1 = parseFloat(document.getElementById("x1Input").value);
  let y1 = parseFloat(document.getElementById("y1Input").value);
  let x2 = parseFloat(document.getElementById("x2Input").value);
  let y2 = parseFloat(document.getElementById("y2Input").value);
  // create vectors
  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);
  // draw vector
  drawVector(v1, "red");
  drawVector(v2, "blue");
  // get op and scalar
  const op = document.getElementById("op").value;
  const scalar = parseFloat(document.getElementById("scalar").value);
  // perform op
  if (op === "add") {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.add(v2);
    drawVector(v3, "green");
  }
  else if (op === "sub") {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.sub(v2);
    drawVector(v3, "green");
  }
  else if (op === "mul") {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.mul(scalar);
    drawVector(v3, "green");
    let v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v4.mul(scalar);
    drawVector(v4, "green");
  }
  else if (op === "div") {
    let v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.div(scalar);
    drawVector(v3, "green");
    let v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v4.div(scalar);
    drawVector(v4, "green");
  }
  else if (op === "mag") {
    console.log("Magnitude v1: ", v1.magnitude());
    console.log("Magnitude v2: ", v2.magnitude());
  }
  else if (op === "norm") {
    let v3 = new Vector3([...v1.elements]).normalize();
    let v4 = new Vector3([...v2.elements]).normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");  
  }
  else if (op === "ab") {
    const a = angleBetween(v1, v2);
    console.log("Angle: ", a.toFixed(2));
  }
  else if (op === "area") {
    const area = areaTriangle(v1, v2);
    console.log("Area of the triangle: ", area.toFixed(2));
  }
}

function angleBetween(v1, v2){
  // dot
  const d = Vector3.dot(v1, v2);
  // magnitudes
  const m1 = v1.magnitude();
  const m2 = v2.magnitude();
  // cos
  const cosT = d / (m1 * m2);
  // fix values
  const toFix = Math.max(-1, Math.min(1, cosT));
  // get angle
  const aRad = Math.acos(toFix);
  const aDeg = aRad * (180 / Math.PI);
  return aDeg;
} 

function areaTriangle(v1, v2) {
  // cross product
  const c = Vector3.cross(v1, v2);
  // magnitude
  const areaOfP = c.magnitude();
  // area
  const areaOfT = areaOfP / 2;
  return areaOfT;
}