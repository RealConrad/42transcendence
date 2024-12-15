export default class RenderManager {
    constructor(ctx, canvas) {
		this.canvas = canvas;
        this.ctx = ctx;
        this.renderables = [];
    }

    addRenderable(object) {
        this.renderables.push(object);
    }

    removeRenderable(object) {
        this.renderables = this.renderables.filter(item => item !== object);
    }

    removeAllRenderables() {
        this.renderables = [];
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        this.clearCanvas();
        this.renderables.forEach(obj => obj.draw(this.ctx));
    }

    resetObjects() {
        this.renderables.forEach(obj => obj.reset());
    }

}