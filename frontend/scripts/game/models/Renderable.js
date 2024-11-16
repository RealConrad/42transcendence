export default class Renderable {
    draw(ctx) {
        throw new Error("draw() must be implemented in subclass");
    }

    reset(ctx) {
        throw new Error("reset() must be implemented in subclass");
    }
}
