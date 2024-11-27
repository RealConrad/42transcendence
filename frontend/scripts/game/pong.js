import Game from "./Game.js";
import {this.canvas.height, CANVAS_WIDTH} from "../utils/constants.js";

const canvas = document.getElementById('pongCanvas');

canvas.width = CANVAS_WIDTH;
canvas.height = this.canvas.height;

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

resizeCanvas();

const game = new Game(canvas, true);
game.start();