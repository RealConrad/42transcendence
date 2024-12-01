import {
    PADDLE_HEIGHT,
    PADDLE_SPEED,
    PADDLE_WIDTH,
    MAX_SCORE,
    BASE_GAME_API_URL, EVENT_TYPES
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
import { apiCall} from "../api/api.js";
import GlobalEventEmitter from "../utils/EventEmitter.js";

export default class Game {
    constructor(canvas, player1Details, player2Details, isTournamentMatch = false) {
        this.isGameOver = false;
        this.isGamePaused = false;
        this.winner = null;
        this.maxScore = MAX_SCORE;
        this.isTournamentMatch = isTournamentMatch;
        this.player1AIDiff = player1Details.aiDifficulty;
        this.player2AIDiff = player2Details.aiDifficulty;

        // Setup canvas
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        // Setup Managers
        this.renderManager = new RenderManager(this.ctx, this.canvas);
        this.collisionManager = new CollisionManager(this);
        this.inputManager = new InputManager()

        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 5, 5, 5);

        this.Battleground = new Battleground(this.canvas);
        
        // Setup player models and controllers
        const player1Paddle = new Paddle(
            0,
            this.canvas.height / 2,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            PADDLE_SPEED,
            this.canvas
        )
        const player2Paddle = new Paddle(
            this.canvas.width - 10,
            this.canvas.height / 2,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            PADDLE_SPEED,
            this.canvas
        )

        this.player1 = player1Details.isAI
            ? new Player(
                player1Details.username,
                player1Paddle,
                new AIController(player1Paddle, this.ball, player1Details.aiDifficulty, this.canvas)
            )
            : new Player(
                player1Details.username,
                player1Paddle,
                new HumanController(player1Paddle, 'w', 's', this.inputManager)
            );
        this.player2 = player2Details.isAI
            ? new Player(
                player2Details.username,
                player2Paddle,
                new AIController(player2Paddle, this.ball, player2Details.aiDifficulty, this.canvas)
            )
            : new Player(
                player2Details.username,
                player2Paddle,
                new HumanController(player2Paddle, 'ArrowUp', 'ArrowDown', this.inputManager)
            );

        // Register renderable objects
        this.renderManager.addRenderable(this.Battleground);
        this.renderManager.addRenderable(this.ball);
        this.renderManager.addRenderable(this.player1.paddle);
        this.renderManager.addRenderable(this.player2.paddle);
        this.renderManager.render();
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        GlobalEventEmitter.on(EVENT_TYPES.PAUSE_GAME, this.pauseGame);
        GlobalEventEmitter.on(EVENT_TYPES.RESUME_GAME, this.resumeGame);
        GlobalEventEmitter.on(EVENT_TYPES.QUIT_GAME, this.quitGame.bind(this));
        this.updatePlayerScore();
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

    cleanup() {
        // TODO: Clean up event listeners
    }

    checkWinCondition() {
        if (this.player1.score === this.maxScore || this.player2.score === this.maxScore) {
            this.isGameOver = true;
             if (this.player1.score === this.maxScore) {
                this.winner = {
                    player1Score: this.player1.score,
                    player2Score: this.player2.score,
                    username: this.player1.username,
                    isAI: this.player1.controller instanceof AIController,
                    difficulty: this.player1.controller instanceof AIController ? this.player1AIDiff : null
                };
                if (!this.isTournamentMatch)
                    this.saveMatch();

            } else if (this.player2.score === this.maxScore) {
                this.winner = {
                    player1Score: this.player1.score,
                    player2Score: this.player2.score,
                    username: this.player2.username,
                    isAI: this.player2.controller instanceof AIController,
                    difficulty: this.player2.controller instanceof AIController ? this.player2AIDiff : null
                };

            }
            if (!this.isTournamentMatch)
                 GlobalEventEmitter.emit(EVENT_TYPES.GAME_OVER, {
                     winner: this.winner.username,
                     isTournament: this.isTournamentMatch
                 });
                this.saveMatch();
        }
    }

    pauseGame() {
        if (this.isGameOver) return;
        this.isGamePaused = true;
        GlobalEventEmitter.emit(EVENT_TYPES.SHOW_GAME_MENU, { isTournament: this.isTournamentMatch });
    }

    resumeGame() {
        if (!this.isGameOver) {
            this.isGamePaused = false;
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    quitGame() {
        this.isGameOver = true;
        this.renderManager.clearCanvas();
        this.resetGameState();
        GlobalEventEmitter.off(EVENT_TYPES.PAUSE_GAME, this.pauseGame);
        GlobalEventEmitter.off(EVENT_TYPES.RESUME_GAME, this.resumeGame);
        GlobalEventEmitter.off(EVENT_TYPES.QUIT_GAME, this.quitGame);
    }

    getWinner() {
        return this.winner;
    }

    resetGameState() {
        // this.ball.celebrate(this.ctx);
        setTimeout(() => {
            this.renderManager.resetObjects();
        }, 1000);
    }

    updatePlayerScore() {
        GlobalEventEmitter.emit(EVENT_TYPES.UPDATE_SCORE, {
            player1Name: this.player1.username,
            player2Name: this.player2.username,
            player1Score: this.player1.score,
            player2Score: this.player2.score,
        });
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
}