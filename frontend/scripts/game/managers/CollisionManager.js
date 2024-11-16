export default class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    checkWallCollision() {
        const ball = this.game.ball;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.game.canvas.height) {
            ball.speedY *= -1;
        }
    }

    checkPaddleCollision(paddle) {
        const ball = this.game.ball;
        if (
            ball.x - ball.radius <= paddle.x + paddle.width &&
            ball.x + ball.radius > paddle.x &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y
        ) {
            ball.speedX *= -1;
        }
    }

    handleCollisions() {
        this.checkWallCollision();
        this.checkPaddleCollision(this.game.player1.paddle);
        this.checkPaddleCollision(this.game.player2.paddle);
    }
}