import {CANVAS_HEIGHT, CANVAS_WIDTH} from "../../utils/constants.js";

export default class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    checkWallCollision() {
        const ball = this.game.ball;
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
            ball.speedY *= -1;
            if (ball.speedX > 0) {ball.speedX += 1} else {ball.speedX -= 1}
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
            ball.speedY = (ball.y - (paddle.y + paddle.height / 2)) * 0.1;
            ball.move();
        }
    }

    checkScoring() {
        if (this.game.ball.x - this.game.ball.radius < 0) {
            this.game.player2.incrementScore();
            this.game.resetGameState();
            this.game.updatePlayerScore();
        }
        else if (this.game.ball.x + this.game.ball.radius > CANVAS_WIDTH) {
            this.game.player1.incrementScore();
            this.game.resetGameState();
            this.game.updatePlayerScore();
        }
    }

    handleCollisions() {
        this.checkWallCollision();
        this.checkPaddleCollision(this.game.player1.paddle);
        this.checkPaddleCollision(this.game.player2.paddle);
        this.checkScoring();
    }
}