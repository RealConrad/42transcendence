import Game from "./Game.js";
import {CANVAS_HEIGHT, CANVAS_WIDTH} from "../utils/constants.js";

const canvas = document.getElementById('pongCanvas');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const resizeCanvas = () => {
    const aspectRatio = 16 / 9;
    let newWidth = window.innerWidth - 200;
    let newHeight = window.innerHeight;

    if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
    } else {
        newHeight = newWidth / aspectRatio;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const game = new Game(canvas, true);
game.start();