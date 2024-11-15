import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_SCORE } from "../utils/constants.js";

export default class Game {
    constructor(canvas, ctx, player1, player2, playerPaddle, opponentPaddle, ball, playerController, opponentController) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.player1 = player1;
        this.player2 = player2;
        this.playerPaddle = playerPaddle;
        this.opponentPaddle = opponentPaddle;
        this.ball = ball;
        this.playerController = playerController;
        this.opponentController = opponentController;
        this.gameState = {
            isGameOver: false,
            winner: null,
            maxScore: MAX_SCORE
        };
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        if (this.gameState.isGameOver) return;

        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        this.playerController.update();
        this.opponentController.update();
        this.ball.move();
        this.checkCollisions();
        this.checkScoring();
        this.checkWinCondition();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.playerPaddle.draw(this.ctx);
        this.opponentPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.updateScoreUI();
    }

    checkCollisions() {
        this.checkWallCollision();
        this.checkPaddleCollision(this.playerPaddle);
        this.checkPaddleCollision(this.opponentPaddle);
    }

    checkWallCollision() {
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > CANVAS_HEIGHT) {
            this.ball.speedY *= -1;
        }
    }

    checkPaddleCollision(paddle) {
        if (
            this.ball.x - this.ball.radius <= paddle.x + paddle.width &&
            this.ball.x + this.ball.radius > paddle.x &&
            this.ball.y - this.ball.radius < paddle.y + paddle.height &&
            this.ball.y + this.ball.radius > paddle.y
        ) {
            this.ball.speedX *= -1;
        }
    }

    checkScoring() {
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.incrementScore();
            this.resetGameState();
        }
        else if (this.ball.x + this.ball.radius > CANVAS_WIDTH) {
            this.player1.incrementScore();
            this.resetGameState();
        }
    }

    checkWinCondition() {
        if (this.player1.score >= this.gameState.maxScore) {
            this.gameState.winner = this.player1;
            this.gameState.isGameOver = true;
            this.displayWinMessage();
        } else if (this.player2.score >= this.gameState.maxScore) {
            this.gameState.winner = this.player2;
            this.gameState.isGameOver = true;
            this.displayWinMessage();
        }
    }

    resetGameState() {
        this.ball.reset();
        this.playerPaddle.reset();
        this.opponentPaddle.reset();
    }

    updateScoreUI() {
        document.getElementById("player1Score").textContent = this.player1.score;
        document.getElementById("player2Score").textContent = this.player2.score;
    }

    displayWinMessage() {
        alert(`Game Over! ${this.gameState.winner.username} wins with a score of ${this.gameState.winner.score}!`);
    }
}