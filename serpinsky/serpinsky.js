class Point {
  constructor(x, y) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }
}

var canvas = document.getElementById('canvas');
var pointSize = 2;
var initialPoint1 = new Point(canvas.width / 2 - 1, 3);
var initialPoint2 = new Point(3, canvas.height - 3);
var initialPoint3 = new Point(canvas.width - 3, canvas.height - 3);
var initialPoints = [initialPoint1, initialPoint2, initialPoint3];
var curPoint = 0;

function sign(p1, p2, p3)
{
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(pt, v1, v2, v3)
{
    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

function canvasClicked(event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  var p = new Point(x,y);

  if (!pointInTriangle(p, initialPoint1, initialPoint2, initialPoint3))
    return;

  curPoint = p;
  drawPoint(curPoint);

  canvas.onclick = null;
  setInterval(drawNext, 10);
}

function drawNext() {
  var initialPoint = initialPoints[Math.floor(Math.random()*initialPoints.length)];
  curPoint = new Point((curPoint.x + initialPoint.x) / 2, (curPoint.y + initialPoint.y) / 2);
  drawPoint(curPoint);
}

function drawPoint(p) {
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ff2626"; // Red color

  ctx.beginPath();
  ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2, true);
  ctx.fill();
}

function load() {
  canvas.onclick = canvasClicked;
  drawPoint(initialPoint1)
  drawPoint(initialPoint2);
  drawPoint(initialPoint3);
}

window.addEventListener('load', load);
