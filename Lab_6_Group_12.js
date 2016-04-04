var gl;
var canvas;
/**
 * A position vector is a vector starting at the origin of the WebGL coordiate system 
 */
var controlPoints; // This array records the position vectors of the 3 most recent user clicks
var curves; // Each entry in this array contains an array of points representing a curve 
var a_Position;
var numClicks; // This variable increases by one each time the user clicks on the canvas

window.onload = function init() {
  curves = [];
  controlPoints = [];
  numClicks = 0;
  setUpWebGL();
  setUpEventHandlers();
  render();
};

function render() { 
  gl.clear(gl.COLOR_BUFFER_BIT);
  var n;
  /**
   * For each array of points in the curves array
   *   1. Place the points of the curve "i" in a vertex buffer
   *   2. Draw the points in the buffer onto the screen
   */
  for (var i = 0; i < curves.length; i++) {
    n = initVertexBuffers(curves[i]);
    gl.drawArrays(gl.LINE_STRIP, 0, n); 
  }
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
     * If the number of click is between 0 and 2 push the position vector
     * of the click onto the controlPoints array
     */
    if (numClicks < 3) {
      controlPoints.push(getClickCoordinates(e));
      numClicks += 1;
    }
    /**
     * If the number of clicks is equal to 3 then the user has provided the position 
     * vectors necessary to generate a curve using the getPointsOnTheCurve function
     */
    if (numClicks == 3) {
      curves.push(getPointsOnTheCurve(controlPoints[0], controlPoints[1], controlPoints[2]));
      // Empty the control points array so the user can push another 3 points onto it
      controlPoints = [];
      // Start counting the 3 clicks again
      numClicks = 0;
      render();
    }
  };

  var plusButton = document.getElementById("plusButton");

  plusButton.onclick = function(e) {
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
    curves = [];
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

  //Get the storage location of a_Position
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