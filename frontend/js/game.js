//game

//declare variables
let batHeight = 25;
let batWidth = 5;
let leftPlayerPosX = 0;
let rightPlayerPosX = canvas.width - batWidth;
let leftPlayerPosY = (canvas.height - batHeight) / 2;
let rightPlayerPosY = (canvas.height - batHeight) / 2;
let ballRadius = 10;
let ballX = (canvas.width - ballRadius) / 2;
let ballY = (canvas.height - ballRadius) / 2;

//draw players
ctx.fillStyle="lightgrey";
ctx.fillRect(leftPlayerPosX, leftPlayerPosY, batWidth, batHeight);
ctx.fillRect(rightPlayerPosX, rightPlayerPosY, batWidth, batHeight);

//draw ball
ctx.fillStyle="red";
ctx.fillRect(ballX, ballY, ballRadius, ballRadius);