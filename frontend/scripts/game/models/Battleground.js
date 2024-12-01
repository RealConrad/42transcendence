import {PADDLE_WIDTH, PADDLE_HEIGHT} from "../../utils/constants.js";
import Renderable from "./Renderable.js";

export default class Battleground extends Renderable {
    constructor(canvas) {
        super();
        this.canvas = canvas
    }

    draw(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = PADDLE_WIDTH;
        ctx.setLineDash([PADDLE_WIDTH, PADDLE_WIDTH]);
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, 0);
        ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    reset(ctx) {
        // ctx.setLineDash([]);
    }
}