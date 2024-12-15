import Renderable from "../Renderable.js";

export const atkPowers = [
    { symbol: "%", title: "The Paddle Games", desc: "Teleport the ball to the other side mirroring its origin position and direction." },
    { symbol: ">", title: "Run Ball, Run!", desc: "Increase the ball speed by x3 until a point gets scored." },
    { symbol: "&", title: "No U!", desc: "Reverses the direction of the ball and increase its speed x2 until a point gets scored." },
    { symbol: "-", title: "Honey, I Shrunk the Paddle", desc: "Halves the size of opponent's paddle until he loses a point." },
    { symbol: "¿", title: "Down is the new Up", desc: "Reverses up and down keys of an opponent until a point is scored or 5 seconds." }
];

export const defPowers = [
    { symbol: "|", title: "You Shall Not Pass!", desc: "Your paddle becomes the max size for 2 seconds or until it deflects the ball with 2x speed for remaining time." },
    { symbol: "@", title: "Get Over Here!", desc: "Pull the ball to your paddle, stick it for 1s and shoot straight with 4x speed for 1 second." },
    { symbol: "+", title: "Paddle STRONG!", desc: "Your paddle doubles in size until point scored." },
    { symbol: "*", title: "Slow-Mo", desc: "The ball slows down for 2 seconds or until hits a paddle and increases speed x2 for a duration of slow-mo part." },
    { symbol: "=", title: "For Justice!", desc: "Teleports paddles of both players to a ball position and freezes them in place for 1 second." }
];

export default class PowerUp extends Renderable {
    constructor(ctx, x, y, type, symbol) {
        super();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.type = type;
        this.symbol = symbol;
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
        ctx.fillText(this.symbol, this.x + this.size / 2, this.y + this.size / 2);
    
        this.frameCount++;
    }
    
    

    collectPowerUp(game, player) {
        if (!this.isActive) return;
        this.isActive = false;
        player.addPowerUp({ type: this.type, symbol: this.symbol });
        game.createPowerUps(1);
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