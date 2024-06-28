//game

//declare variables
let batHeight = canvas.width / 30;
let batWidth = canvas.width / 200;
let leftBatPosX = 0;
let rightBatPosX = canvas.width - batWidth;
let leftBatPosY = (canvas.height - batHeight) / 2;
let rightBatPosY = (canvas.height - batHeight) / 2;
let ballRadius = canvas.width / 130;
let ballX = (canvas.width - ballRadius) / 2;
let ballY = (canvas.height - ballRadius) / 2;

//components
let leftBat     = new component(batWidth, batHeight, "lightgrey", 0, leftBatPosY);
let rightBat    = new component(batWidth, batHeight, "lightgrey", rightBatPosX, rightBatPosY);
let ball        = new component(ballRadius, ballRadius, "red", ballX, ballY);

let interval = setInterval(animate, 10);

function component(width, height, color, x, y){
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    this.update = function(){
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


//create and draw objects
function startGame(){
}

//animate
function animate() {
    console.log('intervals');
    clearGame();
    updateGame();
}
function clearGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function updateGame() {
    ball.x += 2;
    ball.update();
    rightBat.update();
    leftBat.update();
}


// ctx.fillRect(ballX, ballY, ballRadius, ballRadius);

//send to conrad

// size of koordinate system:
//     - x width
//     - y height
// keystrokes