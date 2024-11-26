import {
    PADDLE_HEIGHT,
    PADDLE_SPEED,
    PADDLE_WIDTH,
    MAX_SCORE,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    BASE_GAME_API_URL
} from "../utils/constants.js";
import Paddle from "./models/Paddle.js";
import Player from "./models/Player.js";
import Ball from "./models/Ball.js";
import Battleground from "./models/Battleground.js";
import HumanController from "./controllers/HumanController.js";
import RenderManager from "./managers/RenderManager.js";
import CollisionManager from "./managers/CollisionManager.js";
import AIController from "./controllers/AIController.js";
import InputManager from "./managers/InputManager.js";
import UIManager from "./managers/UIManager.js";
import eventEmitter from "./EventEmitter.js";
import { apiCall} from "../api/api.js";

export default class Game {
    constructor(canvas, vsAI = true) {
        this.isGameOver = false;
        this.isGamePaused = false;
        this.winner = null;
        this.maxScore = MAX_SCORE;

        // Setup canvas
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        // Setup Managers
        this.renderManager = new RenderManager(this.ctx, this.canvas);
        this.collisionManager = new CollisionManager(this);
        this.uiManager = new UIManager();
        this.inputManager = new InputManager()

        this.ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 5, 5, 5);

        this.Battleground = new Battleground();
        
        // Setup player models and controllers
        const playerPaddle = new Paddle(
            0,
            CANVAS_HEIGHT / 2,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            PADDLE_SPEED,
            this.canvas
        )
        const player2Paddle = new Paddle(
            CANVAS_WIDTH - 10,
            CANVAS_HEIGHT / 2,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            PADDLE_SPEED,
            this.canvas
        )

        this.player1 = new Player(
            'Player 1',
            playerPaddle,
            new HumanController(playerPaddle, 'w', 's', this.inputManager)
            // new AIController(playerPaddle, this.ball, 4)
        );
        this.player2 = vsAI
            ? new Player('AI', player2Paddle, new AIController(player2Paddle, this.ball, 1)) // 3rd parameter is the difficulty level of the AI. 1 is super dumb, 5 is tough, 10 is darksouls
            : new Player(
                'Player 2',
                player2Paddle,
                new HumanController(player2Paddle, 'ArrowUp', 'ArrowDown', this.inputManager)
            );

        // Register renderable objects
        this.renderManager.addRenderable(this.Battleground);
        this.renderManager.addRenderable(this.ball);
        this.renderManager.addRenderable(this.player1.paddle);
        this.renderManager.addRenderable(this.player2.paddle);
        this.renderManager.render();

        eventEmitter.on('displayMenu', this.togglePause.bind(this));
        eventEmitter.on('hideMenu', this.resumeGame.bind(this));
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
        this.checkWinCondition();
        this.renderManager.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }


    checkWinCondition() {
        if (this.player1.score === this.maxScore || this.player2.score === this.maxScore) {
            this.isGameOver = true;
            // this.displayWinMessage()
            // TODO: after auth service refactor implement this
            this.saveMatch();
        }
    }

    togglePause() {
        this.isGamePaused = !this.isGamePaused;
    }

    resumeGame() {
        if (!this.isGameOver) {
            this.isGamePaused = false;
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    resetGameState() {
        // this.ball.celebrate(this.ctx);
        setTimeout(() => {
            this.renderManager.resetObjects();
        }, 1000);
    }

    updatePlayerScore() {
        document.getElementById("player1Score").innerHTML = this.player1.score;
        document.getElementById("player2Score").innerHTML = this.player2.score;
    }

    async saveMatch() {
        const payload = {
            "player1_username": this.player1.username,
            "player2_username": this.player2.username,
            "player1_score": this.player1.score,
            "player2_score": this.player2.score,
        }
        const response = await apiCall(`${BASE_GAME_API_URL}/save-match/`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            await response.json();
            console.log("Saved match");
        } else {
            console.error("Failed to save match")
        }
    }

    displayWinMessage() {
        alert(`Game Over! ${this.winner.username} wins with a score of ${this.winner.score}!`);
    }
}