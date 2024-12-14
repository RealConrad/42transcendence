export default class CollisionManager {
    constructor(game) {
        this.game = game;
        this.hype = 0;
        this.hypeCounter = 0;
    }

    checkWallCollision() {
        const ball = this.game.ball;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.game.canvas.height) {
            ball.speedY *= -1;
            ball.speedX = ball.speedX > 0 ? ball.speedX + 1 : ball.speedX - 1;
        }
    }

    checkPaddleCollision(paddle) {
        const ball = this.game.ball;
        if (
            ((ball.x - ball.radius <= paddle.x + paddle.width && paddle.x < this.game.canvas.width / 2) ||
            (ball.x + ball.radius > paddle.x && paddle.x >= this.game.canvas.width / 2)) &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y
        ) {
            ball.speedX *= -1;
            ball.speedY = (ball.y - (paddle.y + paddle.height / 2)) * 0.3;
            ball.move();
            if (paddle.x < this.game.canvas.width / 2) {
                ball.lastTouchedPlayer = this.game.player1;
            } else {
                ball.lastTouchedPlayer = this.game.player2;
            }
        }
    }

    checkScoring() {
        if (this.game.ball.x - this.game.ball.radius < 0 && this.hype === 0) {
            this.hype = 2;
        }
        else if (this.game.ball.x + this.game.ball.radius > this.game.canvas.width && this.hype === 0) {
            this.hype = 1;
        }
        if (this.hype === 2) {
            this.game.player2.incrementScore();
            this.game.updatePlayerScore();
            this.game.ball.reset();
            this.hypeCounter += 1;
        }
        else if (this.hype === 1) {
            this.game.player1.incrementScore();
            this.game.updatePlayerScore();
            this.game.ball.reset();
            this.hypeCounter += 1;
        }
        if (this.hypeCounter > 99) {
            this.game.resetGameState();
            this.hype = 0;
            this.hypeCounter = 0;
        }

    }

    handleCollisions() {
        this.checkWallCollision();
        this.checkPaddleCollision(this.game.player1.paddle);
        this.checkPaddleCollision(this.game.player2.paddle);
        this.checkScoring();
    }
}