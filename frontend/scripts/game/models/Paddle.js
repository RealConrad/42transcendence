import Renderable from "./Renderable.js";
import {CANVAS_HEIGHT} from "../../utils/constants.js";

export default class Paddle extends Renderable {
    constructor(x, y, width, height, speed, canvas) {
        super();
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
		this.canvas = canvas;
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
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.y = this.initialY;
    }
}
