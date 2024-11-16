import Game from "./Game.js";

const canvas = document.getElementById('pongCanvas');

const resizeCanvas = () => {
    const aspectRatio = 16 / 9;
    let newWidth = window.innerWidth - 200;
    let newHeight = window.innerHeight - 200;

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