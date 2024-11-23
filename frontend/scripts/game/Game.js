import {PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH, MAX_SCORE, CANVAS_HEIGHT, CANVAS_WIDTH} from "../utils/constants.js";
import Paddle from "./models/Paddle.js";
import Player from "./models/Player.js";
import Ball from "./models/Ball.js";
import HumanController from "./controllers/HumanController.js";
import RenderManager from "./managers/RenderManager.js";
import CollisionManager from "./managers/CollisionManager.js";
import AIController from "./controllers/AIController.js";
import InputManager from "./managers/InputManager.js";
import UIManager from "./managers/UIManager.js";
import eventEmitter from "./EventEmitter.js";


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

        this.ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 10, 5, 5);

        // Setup player models and controllers
        const playerPaddle = new Paddle(
            10,
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
        );
        this.player2 = vsAI
            ? new Player('AI', player2Paddle, new AIController(player2Paddle, this.ball))
            : new Player(
                'Player 2',
                player2Paddle,
                new HumanController(player2Paddle, 'ArrowUp', 'ArrowDown', this.inputManager)
            );

        // Register renderable objects
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
        this.renderManager.resetObjects();
    }

    updatePlayerScore() {
        document.getElementById("player1Score").innerHTML = this.player1.score;
        document.getElementById("player2Score").innerHTML = this.player2.score;
    }

    saveMatch() {
        console.log("token: ", window.accessToken);
        fetch('http://127.0.0.1:8001/api/game/save-match/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${window.accessToken}`
            },
            credentials: 'include',
            body: JSON.stringify({
                "player1_username": this.player1.username,
                "player2_username": this.player2.username,
                "player1_score": this.player1.score,
                "player2_score": this.player2.score,
            })
        }).then((response) => {
            if (response.ok) {
                console.log("Successfully saved game")
                return response.json();
            } else {
                console.error("Unable to save match");
            }
        })
    }

    displayWinMessage() {
        alert(`Game Over! ${this.winner.username} wins with a score of ${this.winner.score}!`);
    }
}