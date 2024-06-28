//game

//declare variables
let batHeight = canvas.width / 18;
let batWidth = canvas.width / 180;
let ballRadius = canvas.width / 100;
let ballX = (canvas.width - ballRadius) / 2;
let ballY = (canvas.height - ballRadius) / 2;
let ballDir = 1;

//components
let leftBat     = new component(batWidth, batHeight, "pink", 0, (canvas.height - batHeight) / 2);
let rightBat    = new component(batWidth, batHeight, "pink", canvas.width - batWidth, (canvas.height - batHeight) / 2);
let ball        = new component(ballRadius, ballRadius, "red", ballX, ballY);

//useful
let stop = -1;

//calls animate every x times


function component(width, height, color, x, y){
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    this.initialize = function(){
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
    }
    this.update = function(){
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.moveDown = function(){
        if (this.y + this.height < canvas.height) this.y += 1;
    }
    this.moveUp = function(){
        if (this.y > 0) this.y -= 1;
    }
}

//start
let interval = setInterval(animate, 4);
function startGame(){
    console.log('starting');
    console.log('interval over');
}

//animate
function animate() {
    clearGame();
    updateGame();
    if (stop == 1){
        console.log('game end', stop);
        endGame();
    }
}

//end game
function endGame(){
    // stop = -1;
    clearInterval(interval);
    //on losing: reset everything
    //on 'end pause': start new interval with same variables
}

//clearing canvas
function clearGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//repaint canvas
function updateGame() {
    if (ballHitsRacket())
        ballDir *= -1;
    ball.x += ballDir;
    if (Key.isDown(Key.UP)) rightBat.moveUp();
    if (Key.isDown(Key.DOWN)) rightBat.moveDown();
    if (Key.isDown(Key.W)) leftBat.moveUp();
    if (Key.isDown(Key.S)) leftBat.moveDown();
    if (Key.isDown(Key.SPACE)){
        console.log('space key pressed');
        stop *= -1;
    }
    updateComponents();
}

function updateComponents(){
    ball.update();
    rightBat.update();
    leftBat.update();
}

function ballHitsRacket(){
    let rightBatX = canvas.width - batWidth;
    let leftBatX = 0 + batWidth;

    if (ballOnRacketHeight() == false)
        return false;
    if (ball.x >= rightBatX){  //ball hits right bat on x-axis
        ball.x = rightBatX;
        return true;
    }
    else if (ball.x <= leftBatX){  //ball hits left bat on x-axis
        ball.x = leftBatX;
        return true;
    }
    else
        return false;
}

function ballOnRacketHeight(){
    if (ballDir > 0 && ball.y >= rightBat.y && ball.y <= rightBat.y + rightBat.height)
        return true;
    else if (ballDir < 0 && ball.y >= leftBat.y && ball.y <= leftBat.y + leftBat.height)
        return true;
    else
        return false;
}

//detect keys pressed
var Key = {
    _pressed: {},
  
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    SPACE: 32,
    
    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },
    
    onKeydown: function(event) {
      this._pressed[event.keyCode] = true;
    },
    
    onKeyup: function(event) {
      delete this._pressed[event.keyCode];
    }
  };

  window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
  window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

//send to conrad

// size of koordinate system:
//     - x width
//     - y height
// keystrokes