import Renderable from "./Renderable.js";

export default class Ball extends Renderable {
    constructor(x, y, radius, speedX, speedY) {
        super();
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.lastTouchedPlayer = null;
        this.trail = [];
    }

    move() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) { 
            this.trail.shift();
        }
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        for (let i = 0; i < this.trail.length; i++) {
            const trailPoint = this.trail[i];
            const alpha = (i + 1) / this.trail.length;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.rect(
                trailPoint.x - this.radius,
                trailPoint.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
            ctx.fill();
            ctx.closePath();
        }

        ctx.globalAlpha = 1; 

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.rect(
            this.x - this.radius, 
            this.y - this.radius, 
            this.radius * 2, 
            this.radius * 2  
        );
        ctx.fill();
        ctx.closePath();
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.speedX = 1 * (Math.random() > 0.5 ? 5 : -5);
        this.speedY = 1 * (Math.random() > 0.5 ? 5 : -5);
        this.trail = []; 
        this.lastTouchedPlayer = null;
    }
}
