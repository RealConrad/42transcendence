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
import {apiCall, fetchMatchHistory} from "../api/api.js";
import GlobalEventEmitter from "../utils/EventEmitter.js";
import PowerUp from "./models/powerups/PowerUp.js";
import { atkPowers, defPowers } from "./models/powerups/PowerUp.js";
import GlobalCacheManager from "../utils/CacheManager.js";

export default class Game {
    constructor(canvas, player1Details, player2Details, isTournamentMatch = false, powerUpCount = 0) {
        this.isGameOver = false;
        this.isGamePaused = false;
        this.winner = null;
        this.maxScore = MAX_SCORE;
        this.isTournamentMatch = isTournamentMatch;
        this.player1AIDiff = player1Details.aiDifficulty;
        this.player2AIDiff = player2Details.aiDifficulty;
        this.powerUpCount = powerUpCount;

        // Setup canvas
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        // Setup Managers
        this.renderManager = new RenderManager(this.ctx, this.canvas);
        this.collisionManager = new CollisionManager(this);
        this.inputManager = new InputManager()

        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 5, 15, 15);

        this.Battleground = new Battleground(this.canvas);


        // Setup powerups
        if (this.powerUpCount > 0) {
            this.powerUps = [];
            this.createPowerUps(this.powerUpCount);
        }

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
                player1Details.id,
                player1Paddle,
                new AIController(player1Paddle, this.ball, player1Details.aiDifficulty, this.canvas)
            )
            : new Player(
                player1Details.username,
                player1Details.id,
                player1Paddle,
                new HumanController(player1Paddle, 'w', 's', this.inputManager)
            );

        this.player2 = player2Details.isAI
            ? new Player(
                player2Details.username,
                player2Details.id,
                player2Paddle,
                new AIController(player2Paddle, this.ball, player2Details.aiDifficulty, this.canvas)
            )
            : new Player(
                player2Details.username,
                player2Details.id,
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

    createPowerUps(count) {
        for (let i = 0; i < count; i++) {
            const randomType = Math.random() > 0.5 ? "ATK" : "DEF";
            const powerList = randomType === "ATK" ? atkPowers : defPowers;
            const randomPower = powerList[Math.floor(Math.random() * powerList.length)];
    
            const randomX = Math.random() * (this.canvas.width - 30 - this.canvas.width/2);
            const randomY = Math.random() * (this.canvas.height - 30);
    
            const power = new PowerUp(this.ctx, randomX + this.canvas.width/4, randomY, randomType, randomPower.symbol);
            this.powerUps.push(power);
            this.renderManager.addRenderable(power);
        }
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        if (this.isGameOver || this.isGamePaused) return;

        console.log("game loop...");
        this.collisionManager.handleCollisions();
        this.ball.move();
        this.player1.controller.update();
        this.player2.controller.update();
        this.handlePowerUpActivation();
        this.renderManager.render();
        if (this.powerUpCount > 0) {
            this.checkPowerUpCollection();
            this.player1.drawInventory(this.ctx, 30, this.canvas.height - 60);
            this.player2.drawInventory(this.ctx, this.canvas.width - 160, this.canvas.height - 60);
        }
        this.checkWinCondition();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    handlePowerUpActivation() {
        if (this.player1.controller.ai === true) {
            this.player1.evaluatePowerUps(this)
        } 
        if (this.player2.controller.ai === true) {
            this.player2.evaluatePowerUps(this)
        }
        if (this.inputManager.isKeyPressed('a')) {
            this.player1.activatePowerUp("ATK", this);
        }
        if (this.inputManager.isKeyPressed('d')) {
            this.player1.activatePowerUp("DEF", this);
        }

        if (this.inputManager.isKeyPressed('ArrowLeft')) {
            this.player2.activatePowerUp("ATK", this);
        }
        if (this.inputManager.isKeyPressed('ArrowRight')) {
            this.player2.activatePowerUp("DEF", this);
        }
    }
    

    checkPowerUpCollection() {
        this.powerUps.forEach(powerUp => {
            if (powerUp.isActive && this.checkCollision(this.ball, powerUp)) {
                const lastTouchPlayer = this.ball.lastTouchedPlayer;
                if (lastTouchPlayer) {
                    powerUp.collectPowerUp(this, lastTouchPlayer);
                } else {
                    console.log("Power-Up collected with no owner, generating new one...");
                    powerUp.isActive = false;
                    this.createPowerUps(2);
                }
            }
        });
    }
    
    checkCollision(ball, powerUp) {
        return (
            ball.x < powerUp.x + powerUp.size &&
            ball.x + ball.radius > powerUp.x &&
            ball.y < powerUp.y + powerUp.size &&
            ball.y + ball.radius > powerUp.y
        );
    }

    cleanup() {
        // TODO: Clean up event listeners
        GlobalEventEmitter.off(EVENT_TYPES.PAUSE_GAME, this.pauseGame);
        GlobalEventEmitter.off(EVENT_TYPES.RESUME_GAME, this.resumeGame);
        GlobalEventEmitter.off(EVENT_TYPES.QUIT_GAME, this.quitGame);
    }

    checkWinCondition() {
        if (this.player1.score === this.maxScore || this.player2.score === this.maxScore) {
            console.log("GAME OVER!");
            this.isGameOver = true;
             if (this.player1.score === this.maxScore) {
                this.winner = {
                    player1Score: this.player1.score,
                    player2Score: this.player2.score,
                    username: this.player1.username,
                    id: this.player1.id,
                    isAI: this.player1.controller instanceof AIController,
                    difficulty: this.player1.controller instanceof AIController ? this.player1AIDiff : null
                };
            } else if (this.player2.score === this.maxScore) {
                this.winner = {
                    player1Score: this.player1.score,
                    player2Score: this.player2.score,
                    username: this.player2.username,
                    id: this.player2.id,
                    isAI: this.player2.controller instanceof AIController,
                    difficulty: this.player2.controller instanceof AIController ? this.player2AIDiff : null
                };
            }
            if (!this.isTournamentMatch) {
                 GlobalEventEmitter.emit(EVENT_TYPES.GAME_OVER, {
                     winner: this.winner.username,
                     isTournament: this.isTournamentMatch
                 });
                this.saveMatch();
            }
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
        try {
            const payload = {
                "player1_username": this.player1.username,
                "player2_username": this.player2.username,
                "player1_score": this.player1.score,
                "player2_score": this.player2.score,
            };
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
                // TODO: Toast
                console.log("Saved match");
                try {
                    const updatedMatchHistory = await fetchMatchHistory();
                    GlobalCacheManager.set("matches", updatedMatchHistory);
                } catch (error) {
                    // TODO: Toast
                    console.log("Failed to update match history after saving: ", error);
                }
            } else {
                // TODO: Toast
                console.error("Failed to save match");
            }
        } catch (error) {
            // TODO: Toast
            console.log("error while saving match:", error);
        }
    }
}