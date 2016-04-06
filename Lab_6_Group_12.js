var gl;
var canvas;
/**
 * A position vector is a vector starting at the origin of the WebGL coordiate system 
 */
var controlPoints; // This array holds position vectors of user clicks
var curve; // This is an array of points representing a curve
var alpha;
var steppingFactor;
var n;
var a_Position;

window.onload = function init() {
  controlPoints = [];
  curve = [];
  alpha = 1;
  steppingFactor = -0.01;
  setUpWebGL();
  setUpEventHandlers();
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (controlPoints.length == 3) {
    n = initVertexBuffers(getPointsOnTheCurve(controlPoints[0], scale(alpha, controlPoints[1]), controlPoints[2]));
    gl.drawArrays(gl.LINE_STRIP, 0, n);
    alpha += steppingFactor;
    if (alpha <= -1) {
      steppingFactor *= -1;
    } else if (alpha >= 1) {
      steppingFactor *= -1;
    }
  }
  window.requestAnimFrame(render);
}

/**
 * @param A The first control point, i.e. the begining of the curved line
 * @param B The second control point
 * @param C The third control point, i.e the end of the curved line
 * @return a set of coordinates/points representing the curve, these points
 *         are formatted for the initVertexBuffers function
 */
function getPointsOnTheCurve(A, B, C) {
  /**
   * We are working with a second-order, or quadratic, Bézier curve.
   * Go to https://www.jasondavies.com/animated-bezier for
   * a nice visualization of what is going on in this function
   */
  var t = 0; // The parameter t ranges from 0 to 1
  var currentVector;
  var vectors = [];
  var points = [];
  /**
   * Generate the position vectors that fall along the specified curve
   */
  while (t <= 1) {
    // The vector math helper functions come from the MV.js file used in the Angel book
    currentVector = add(add(scale(Math.pow(1 - t, 2), A), scale(2 * t * (1 - t), B)), scale(Math.pow(t, 2), C));
    vectors.push(currentVector);
    t += 0.01;
  }
  /**
   * Format the vectors as WebGL friendly points / coordinates
   */
  for (var i = 0; i < vectors.length; i++) {
    for (var j = 0; j < vectors[i].length; j++) {
      points.push(vectors[i][j]);
    }
  }
  return points;
}

function setUpEventHandlers() {
  canvas.onmousedown = function(e) {
    /**
     * Record the position vectors of user clicks,
     * these are the control points used to generate the curve
     */
    if (controlPoints.length < 3) {
      controlPoints.push(getClickCoordinates(e));
    }
    /**
     * If there is 3 control points then the user has provided the position 
     * vectors necessary to generate a curve using the getPointsOnTheCurve function
     */
    if (controlPoints.length == 3) {
      curve = getPointsOnTheCurve(controlPoints[0], controlPoints[1], controlPoints[2]);
      render();
    }
  };

  var plusButton = document.getElementById("plusButton");

  plusButton.onclick = function(e) {
    steppingFactor *= 1.25;
  };

  var minusButton = document.getElementById("minusButton");

  minusButton.onclick = function(e) {
    steppingFactor *= 0.50;
  };

  var clearButton = document.getElementById("clearButton");

  clearButton.onclick = function(e) {
    controlPoints = [];
    curves = [];
    steppingFactor = -0.01;
    render();
  };
}

function getClickCoordinates(e) {
  var rect = e.target.getBoundingClientRect();
  x = ((e.clientX - rect.left) - (canvas.width / 2)) / (canvas.width / 2);
  y = ((canvas.height / 2) - (e.clientY - rect.top)) / (canvas.height / 2);
  return vec2(x, y);
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

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
  }
}

function initVertexBuffers(points) {
  var n = (points.length) / 2;
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
  }

  // Bind the buffer object to target
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