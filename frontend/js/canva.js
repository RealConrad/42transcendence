//frame
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// set canvas height and width according to main-frame
let element = document.getElementById("main-frame");
let positionInfo = element.getBoundingClientRect();
canvas.height = positionInfo.height;
canvas.width = positionInfo.width;

//draw middle line
ctx.strokeStyle = "lightgrey";
ctx.beginPath();
ctx.moveTo(canvas.width / 2, 0);
ctx.lineTo(canvas.width / 2, canvas.height);
ctx.lineWidth = 1;
ctx.stroke();