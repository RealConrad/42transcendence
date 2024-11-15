import {CANVAS_HEIGHT, CANVAS_WIDTH} from "../../utils/constants.js";

export default class Ball {
    constructor(x, y, radius, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        // TODO: Change these values to something more interesting
        this.speedX = 5;
        this.speedY = 5;
    }
}