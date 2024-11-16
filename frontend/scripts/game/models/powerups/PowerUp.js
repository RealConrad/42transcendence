import Renderable from "../Renderable";

export default class PowerUp extends Renderable {
    constructor(ctx, x, y, type) {
        super();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.type = type;
        this.isActive = true;
    }
    draw(ctx) {
        // TODO: Perhaps we make a unified drawing function for all powerups?? idk yet
        throw new Error("draw() must be implemented in sub class");
    }

    applyPowerUpEffect(game, player) {
        throw new Error("applyPowerUpEffect() must be implemented in sub class");
    }

    removePowerUpEffect(game, player) {
        throw new Error("removePowerUpEffect must be implemented in sub class");
    }

    reset(ctx) {
        // TODO: Reset all powerups
    }

    update() {
        // TODO: Handle animations/special ui effects here
    }
}