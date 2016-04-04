var gl;
var canvas;
var controlPoints;
var curves;
var a_Position;
var numClicks;

window.onload = function init() {
  curves = [];
  controlPoints = [];
  numClicks = 0;
  setUpWebGL();
  setUpEventHandlers();
  getPointsOnTheCurve();
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  var n = initVertexBuffers(getPointsOnTheCurve());
  gl.drawArrays(gl.LINE_STRIP, 0, n);
}

function getPointsOnTheCurve() {
  var A = vec2(-0.1875, -0.1796875);
  var B = vec2(0.30078125, 0.09375);
  var C = vec2(0.71484375, -0.19140625);
  var t = 0;
  var currentVector;
  var vectors = [];
  var points = [];
  while (t <= 1) {
    currentVector = add(add(scale(Math.pow(1 - t, 2), A), scale(2*t*(1 - t), B)), scale(Math.pow(t, 2), C));
    vectors.push(currentVector);
    t += 0.01;
  }
  for (var i = 0; i < vectors.length; i++) {
    for (var j = 0; j < vectors[i].length; j++) {
      points.push(vectors[i][j]);
    }
  }
  return points;
}

function setUpWebGL() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //Get the storage location of a_Position, assign and enable buffer
  a_Position = gl.getAttribLocation(program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
  }
}

function setUpEventHandlers() {
  canvas.onmousedown = function(e) {
    controlPoints.push(getClickCoordinates(e));
    render();
  };

  var plusButton = document.getElementById("plusButton");

  plusButton.onclick = function(e) {
    if (numClicks <= 3) {
      numClicks += 1;
    } else {
      numClicks = 0;
    }
    console.log("plusButton was clicked");
  };

  var minusButton = document.getElementById("minusButton");

  minusButton.onclick = function(e) {
    console.log("minusButton was clicked");
  };

  var clearButton = document.getElementById("clearButton");

  clearButton.onclick = function(e) {
    console.log("clearButton was clicked");
    controlPoints = [];
    render();
  };
}

function getClickCoordinates(e) {
  var rect = e.target.getBoundingClientRect();
  x = ((e.clientX - rect.left) - (canvas.width / 2)) / (canvas.width / 2);
  y = ((canvas.height / 2) - (e.clientY - rect.top)) / (canvas.height / 2);
  return vec2(x, y);
}

function initVertexBuffers(points){
  var n = (points.length) / 2;
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
  }

  // Bind the buffer object to target;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment of the buffer object
  gl.enableVertexAttribArray(a_Position);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}