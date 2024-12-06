export default class Player {
    constructor(username, paddle, controller) {
        this.username = username;
        this.score = 0;
        this.paddle = paddle;
        this.controller = controller;
        this.atkPowerUp = null;
        this.defPowerUp = null; //
    }
    

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }


    drawInventory(ctx, x, y) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(x, y, 60, 60);
    
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "16px Arial";
        ctx.fillText(this.atkPowerUp ? this.atkPowerUp.symbol : "ATK", x + 30, y + 30);
    
        ctx.strokeRect(x, y + 70, 60, 60);
        ctx.fillText(this.defPowerUp ? this.defPowerUp.symbol : "DEF", x + 30, y + 100);
    
        ctx.globalAlpha = 1;
    }
    

    addPowerUp(powerUp) {
        if (powerUp.type === "ATK") {
            this.atkPowerUp = powerUp;
        } else if (powerUp.type === "DEF") {
            this.defPowerUp = powerUp;
        }
        console.log(`${this.username} collected ${powerUp.type}: ${powerUp.symbol}`);
    }
    
    removePowerUp(powerUpToRemove) {
        this.powerUps = this.powerUps.filter((powerUp) => powerUp !== powerUpToRemove)
    }

    activatePowerUp(type, game) {
        const powerUp = type === "ATK" ? this.atkPowerUp : this.defPowerUp;
        if (!powerUp) {
            console.log(`No ${type} power-up to activate!`);
            return;
        }
    
        console.log(`${this.username} activated ${type} power-up: ${powerUp.symbol}`);
        this.applyPowerUpEffect(powerUp, game);
    
        if (type === "ATK") this.atkPowerUp = null;
        if (type === "DEF") this.defPowerUp = null;
    }

    applyPowerUpEffect(powerUp, game) {
        switch (powerUp.symbol) {
            case "%": // "The Paddle Games"
                game.ball.x = game.canvas.width - game.ball.x; // Teleport
                game.ball.speedX = -game.ball.speedX; // reverse direction
                break;
            case ">": // "Run Ball, Run!"
                game.ball.speedX *= 3;
                game.ball.speedY *= 3;
                break;
            case "&": // "No U!"
                game.ball.speedX = -game.ball.speedX;
                game.ball.speedY = -game.ball.speedY;
                break;
            case "-": // "Honey, I Shrunk the Paddle"
                if (this === game.player1) game.player2.paddle.height /= 2;
                else if (this === game.player2) game.player1.paddle.height /= 2;
                break;
            case "¿": // "Down is the new Up"
                if (this === game.player1) game.player2.paddle.speed *= -1;
                else if (this === game.player2) game.player1.paddle.speed *= -1;
                break;
            case "|": // "You Shall Not Pass!"
                this.paddle.height *= 4;
                game.ball.speedX *= 2;
                game.ball.speedY *= 2;
                break;
            case "@": // "Get Over Here!"
                const paddleCenterX = this.paddle.x + this.paddle.width / 2;
                const paddleCenterY = this.paddle.y + this.paddle.height / 2;
                const vectorX = paddleCenterX - game.ball.x;
                const vectorY = paddleCenterY - game.ball.y;
                const vectorLength = Math.sqrt(vectorX ** 2 + vectorY ** 2);
                const normalizedX = vectorX / vectorLength;
                const normalizedY = vectorY / vectorLength;
                const newSpeed = Math.sqrt(game.ball.speedX ** 2 + game.ball.speedY ** 2) * 4;
                game.ball.speedX = normalizedX * newSpeed;
                game.ball.speedY = normalizedY * newSpeed;
                break;
            case "+": // "Paddle STRONG!"
                this.paddle.height *= 2;
                break;
            case "*": // "Slow-Mo"
                game.ball.speedX /= 3;
                game.ball.speedY /= 3;
                break;
            case "=": // "For Justice!"
                game.player1.paddle.y = game.ball.y;
                game.player2.paddle.y = game.ball.y;
                break;
            default:
                console.log("Unknown power-up effect!");
        }
    }
}
