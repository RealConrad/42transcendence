import Game from "./Game.js";

const canvas = document.getElementById('pongCanvas');
const game = new Game(canvas, true);
game.start();