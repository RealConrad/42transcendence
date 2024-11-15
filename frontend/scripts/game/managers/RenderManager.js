import {CANVAS_WIDTH, CANVAS_HEIGHT} from "../../utils/constants.js";

export default class RenderManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.renderables = [];
    }

    addRenderable(object) {
        this.renderables.push(object);
    }

    removeRenderable(object) {
        this.renderables = this.renderables.filter(item => item !== object);
    }

    render() {
        // console.log("Rendering obj!");
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.renderables.forEach(obj => obj.draw(this.ctx));
    }

    resetObjects() {
        this.renderables.forEach(obj => obj.reset());
    }

}