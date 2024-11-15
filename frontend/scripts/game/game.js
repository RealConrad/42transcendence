import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_SCORE } from "../utils/constants.js";
import {PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH} from "../utils/constants.js";
import Paddle from "./models/Paddle.js";
import Player from "./models/Player.js";
import Ball from "./models/Ball.js";
import HumanController from "./controllers/HumanController.js";
import RenderManager from "./managers/RenderManager.js";
import CollisionManager from "./managers/CollisionManager.js";


export default class Game {
    constructor(canvas) {
        this.isGameOver = false;
        this.isGamePaused = false;
        this.winner = null;
        this.maxScore = MAX_SCORE;

        // Setup canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 5, 5);

        // Setup player models and controllers
        const playerPaddle = new Paddle(10, canvas.height / 2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED)
        const opponentPaddle = new Paddle(canvas.width - 10, canvas.height / 2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED)
        const playerController = new HumanController(playerPaddle, 'w', 's');
        const opponentController = new HumanController(opponentPaddle, 'ArrowUp', 'ArrowDown'); // TODO: DETERMINE IF ITS AI OR NOT
        this.player1 = new Player('Player 1', playerPaddle, playerController);
        this.player2 = new Player('Player 2', opponentPaddle, opponentController);

        // Setup Managers
        this.renderManager = new RenderManager(this.ctx);
        this.collisionManager = new CollisionManager(this);

        // Register renderable objects
        this.renderManager.addRenderable(this.ball);
        this.renderManager.addRenderable(this.player1.paddle);
        this.renderManager.addRenderable(this.player2.paddle);
        this.renderManager.render();
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        if (this.isGameOver || this.isGamePaused) return;

        this.collisionManager.handleCollisions()
        this.ball.move();
        this.player1.controller.update();
        this.player2.controller.update();
        this.checkScoring();
        this.checkWinCondition();
        this.renderManager.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    togglePause() {
        this.isGamePaused = !this.isGamePaused;
    }

    checkScoring() {
        if (this.ball.x - this.ball.radius < 0) {
            this.player2.incrementScore();
            this.resetGameState();
            this.updateScoreUI();
        }
        else if (this.ball.x + this.ball.radius > CANVAS_WIDTH) {
            this.player1.incrementScore();
            this.resetGameState();
            this.updateScoreUI();
        }
    }

    checkWinCondition() {
        if (this.player1.score >= this.maxScore) {
            this.winner = this.player1;
            this.isGameOver = true;
            this.displayWinMessage();
        } else if (this.player2.score >= this.maxScore) {
            this.winner = this.player2;
            this.isGameOver = true;
            this.displayWinMessage();
        }
    }

    resetGameState() {
        this.renderManager.resetObjects();
    }

    updateScoreUI() {
        document.getElementById("player1Score").textContent = this.player1.score;
        document.getElementById("player2Score").textContent = this.player2.score;
    }

    displayWinMessage() {
        alert(`Game Over! ${this.winner.username} wins with a score of ${this.winner.score}!`);
    }
}