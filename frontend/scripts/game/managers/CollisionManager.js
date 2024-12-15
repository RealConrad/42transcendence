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
             (ball.x + ball.radius >= paddle.x && paddle.x >= this.game.canvas.width / 2)) &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y
        ) {
            ball.speedX *= -1;
            ball.speedY = (ball.y - (paddle.y + paddle.height / 2)) * 0.3;
            ball.x = paddle.x + (paddle.x < this.game.canvas.width / 2 ? paddle.width + ball.radius : -ball.radius); // Correct ball position
            ball.move();
            ball.lastTouchedPlayer = paddle.x < this.game.canvas.width / 2 ? this.game.player1 : this.game.player2;
        }
    }

    checkScoring() {
        const ball = this.game.ball;
        const player1Paddle = this.game.player1.paddle;
        const player2Paddle = this.game.player2.paddle;

        if (
            ball.x - ball.radius < 0 &&
            ball.x + ball.radius < player1Paddle.x && // Ensure ball is completely beyond Player 1's paddle
            this.hype === 0
        ) {
            this.hype = 2;
        } else if (
            ball.x + ball.radius > this.game.canvas.width &&
            ball.x - ball.radius > player2Paddle.x + player2Paddle.width && // Ensure ball is completely beyond Player 2's paddle
            this.hype === 0
        ) {
            this.hype = 1;
        }

        if (this.hype === 2) {
            this.game.player2.incrementScore();
            this.game.updatePlayerScore();
            this.game.ball.reset();
            this.hypeCounter += 1;
        } else if (this.hype === 1) {
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