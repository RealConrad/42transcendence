import Renderable from "../Renderable.js";


export default class PowerUp extends Renderable {
    constructor(ctx, x, y, type) {
        super();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.type = type;
        this.isActive = true;
        this.size = 40;
        this.frameCount = 0;
    }

    draw(ctx) {
        if (!this.isActive) return;
    
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    
        const shakeIntensity = 6;
        const shakeFrequency = 6;
    
        if (this.frameCount % shakeFrequency === 0) {
            this.offsets = Array.from({ length: 3 }, () => ({
                x: (Math.random() - 0.5) * shakeIntensity,
                y: (Math.random() - 0.5) * shakeIntensity,
            }));
        }
    
        this.offsets.forEach(offset => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillRect(this.x + offset.x, this.y + offset.y, this.size, this.size);
        });
    
        ctx.fillStyle = "black";
        ctx.font = "30px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.type, this.x + this.size / 2, this.y + this.size / 2);
    
        this.frameCount++;
    }
    
    

    collectPowerUp(game, player) {
        if (!this.isActive) return;
        this.isActive = false; 
        console.log(`Power-up ${this.type} collected by ${player.username}`);
        this.applyPowerUpEffect(game, player);
    }

    applyPowerUpEffect(game, player) {
        //
    }

    removePowerUpEffect(game, player) {
            //
    }

    reset(ctx) {
        // TODO: Reset all powerups
    }
    
    update() {
        // TODO: Handle animations/special ui effects here
    }
}