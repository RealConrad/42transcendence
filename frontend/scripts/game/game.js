import Paddle from "./Paddle.js";
import Player from "./Player.js";
import Ball from "./Ball.js";
import GameState from "./GameState.js";
import HumanController from "./HumanController.js";
import {PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH} from "../utils/constants.js";


const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const player1 = new Player('Player 1');
const player2 = new Player('Player 2');
const playerPaddle = new Paddle(10, canvas.height / 2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED)
const opponentPaddle = new Paddle(canvas.width - 10, canvas.height / 2, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED)
player1.paddle = playerPaddle;
player2.paddle = opponentPaddle;

const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 2, 2);

const gameState = new GameState(player1, player2, ball);

const playerController = new HumanController(playerPaddle, 'w', 's');

// TODO: Determine if its human or AI as opponent
const opponentController = new HumanController(opponentPaddle, 'ArrowUp', 'ArrowDown');

const gameLoop = () => {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

const update = () => {
    playerController.update();
    opponentController.update();
    ball.move();

}

const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player1.paddle.draw(ctx);
    player2.paddle.draw(ctx);
    ball.draw(ctx);
}

gameLoop();