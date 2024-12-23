export default class Player {
    constructor(username, id, paddle, controller) {
        this.username = username;
        this.score = 0;
        this.paddle = paddle;
        this.controller = controller;
        this.atkPowerUp = null;
        this.defPowerUp = null;
        this.id = id;
        this.ai = controller.ai;
        this.ball = controller.ball;
        this.canvas = controller.canvas;
    }
    

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }

    drawInventory(ctx, x, y) {
        const slotSize = 60;
        const padding = 10;
    
        const drawSlot = (slotX, slotY, powerUp, label) => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(slotX, slotY, slotSize, slotSize, 10);
            ctx.stroke();

            if (!powerUp) {
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "16px Arial";
                ctx.fillText(label, slotX + slotSize / 2, slotY + slotSize / 2);
            }

            if (powerUp) {
                ctx.fillStyle = "white";
                ctx.font = "30px 'Press Start 2P'";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(powerUp.symbol, slotX + slotSize / 2, slotY + slotSize / 2);
            }

            ctx.globalAlpha = 1;
        };

        drawSlot(x, y, this.atkPowerUp, "ATK");
        drawSlot(x + slotSize + padding, y, this.defPowerUp, "DEF");
    }
    
    

    addPowerUp(powerUp) {
        if (powerUp.type === "ATK") {
            this.atkPowerUp = powerUp;
        } else if (powerUp.type === "DEF") {
            this.defPowerUp = powerUp;
        }
    }
    
    removePowerUp(powerUpToRemove) {
        this.powerUps = this.powerUps.filter((powerUp) => powerUp !== powerUpToRemove)
    }

    activatePowerUp(type, game) {
        if (this.controller.ai === true) {
            return;
        }
        const powerUp = type === "ATK" ? this.atkPowerUp : this.defPowerUp;
        if (!powerUp) {
            return;
        }
    
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
                game.ball.speedX = -game.ball.speedX * 2;
                game.ball.speedY = -game.ball.speedY * 2;
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
                game.ball.speedX /= 2;
                game.ball.speedY /= 2;
                break;
            case "@": // "Get Over Here!"
                const paddleCenterX = this.paddle.x + this.paddle.width / 2;
                const paddleCenterY = this.paddle.y + this.paddle.height / 2;
                const vectorX = paddleCenterX - game.ball.x;
                const vectorY = paddleCenterY - game.ball.y;
                const vectorLength = Math.sqrt(vectorX ** 2 + vectorY ** 2);
                const normalizedX = vectorX / vectorLength;
                const normalizedY = vectorY / vectorLength;
                const newSpeed = Math.sqrt(game.ball.speedX ** 2 + game.ball.speedY ** 2) * 2;
                game.ball.speedX = normalizedX * newSpeed;
                game.ball.speedY = normalizedY * newSpeed;
                break;
            case "+": // "Paddle STRONG!"
                this.paddle.height *= 2;
                break;
            case "*": // "Slow-Mo"
                const normal = Math.sqrt(game.ball.speedX ** 2 + game.ball.speedY ** 2);
                game.ball.speedX = game.ball.speedX / normal;
                game.ball.speedY = game.ball.speedY / normal;
                break;
            case "=": // "For Justice!"
                game.player1.paddle.y = game.ball.y;
                game.player2.paddle.y = game.ball.y;
                break;
            default:
                console.log("Unknown power-up effect!");
        }
    }

    
    activatePowerUpAI(type, game) {
        const powerUp = type === "ATK" ? this.atkPowerUp : this.defPowerUp;
        if (!powerUp) return;
    
        this.applyPowerUpEffect(powerUp, game);
    
        if (type === "ATK") this.atkPowerUp = null;
        if (type === "DEF") this.defPowerUp = null;
    }
    


    evaluatePowerUps(game) {
        if (this.atkPowerUp) {
            switch (this.atkPowerUp.symbol) {
                case "%": // Teleport ball
                    const ballOnAISide = this.ball.x > this.canvas.width * 3 / 4;
                    const opponentCannotReach = 
                        Math.abs(game.player1.paddle.y + game.player1.paddle.height / 2 - this.ball.y) > game.player1.paddle.height / 2;
                    if (ballOnAISide && opponentCannotReach) {
                        this.activatePowerUpAI("ATK", game);
                    }
                    break;
    
                case ">": // Speed up ball
                    if (this.ball.lastTouchedPlayer === this && Math.abs(this.ball.dx) > 2) {
                        this.activatePowerUpAI("ATK", game);
                    }
                    break;
    
                case "&": // Reverse ball direction
                    const ballTooFastForAI = this.ball.dx > 0 && Math.abs(this.ball.y - this.paddle.y) > this.paddle.height / 2;
                    if (ballTooFastForAI) {
                        this.activatePowerUpAI("ATK", game);
                    }
                    break;
    
                case "-": // Shrink opponent paddle
                    this.activatePowerUpAI("ATK", game);
                    break;
    
                case "¿": // Reverse opponent controls
                    this.activatePowerUpAI("ATK", game);
                    break;
            }
        }
    
        if (this.defPowerUp) {
            switch (this.defPowerUp.symbol) {
                case "|": // Max size paddle
                case "+": // Paddle strong
                    this.activatePowerUpAI("DEF", game);
                    break;

                case "@": // Pull ball
                case "*": // Slow-mo ball
                case "=": // Freeze paddles
                    const ballTooFastForAI = Math.abs(this.ball.y - this.paddle.y) > this.paddle.height / 2;
                    if (ballTooFastForAI) {
                        this.activatePowerUpAI("DEF", game);
                    }
                    break;
            }
        }
    }
}
