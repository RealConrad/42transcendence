import {CANVAS_HEIGHT} from "../../utils/constants.js";

export default class Paddle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        // change in y velocity
        this.dy = 0;
    }

    move() {
        this.y += this.dy
        if (this.y < 0) {
            this.y = 0;
        }
        else if (this.y + this.height > CANVAS_HEIGHT)
            this.y = CANVAS_HEIGHT - this.height;
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.y = this.initialY;
    }
}
