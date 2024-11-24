import {CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_WIDTH, PADDLE_HEIGHT} from "../../utils/constants.js";
import Renderable from "./Renderable.js";

export default class Battleground extends Renderable {
    constructor() {
        super();
    }

    draw(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = PADDLE_WIDTH * 1.0;
        ctx.setLineDash([PADDLE_WIDTH * 1.0, PADDLE_WIDTH * 1.0]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT); 
        ctx.stroke();
        ctx.setLineDash([]);
    }

    reset() {

    }
}