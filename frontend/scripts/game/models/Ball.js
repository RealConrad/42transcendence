import Renderable from "./Renderable.js";

export default class Ball extends Renderable {
    constructor(x, y, radius) {
        super();
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.radius = radius;

        const angleDegrees = this.getRandomAngle();
        const angleRadians = angleDegrees * (Math.PI / 180);

        const speedMagnitude = 2;
        this.speedMagnitude = speedMagnitude;
        this.speedX = speedMagnitude * Math.cos(angleRadians);
        this.speedY = speedMagnitude * Math.sin(angleRadians);

        this.lastTouchedPlayer = null;
        this.trail = [];
    }

   getRandomAngle() {
        const intervals = [
            { start: 0, end: 45 },    // 0° to 60°
            { start: 135, end: 180 }, // 120° to 240°
            { start: 180, end: 225 }, // 120° to 240°
            { start: -45, end: 0 }    // -60° to 0°
        ];
        const chosenInterval = intervals[Math.floor(Math.random() * intervals.length)];
        return chosenInterval.start + Math.random() * (chosenInterval.end - chosenInterval.start);;
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
        this.speedX = this.speedMagnitude * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = this.speedMagnitude * (Math.random() > 0.5 ? 1 : -1);
        this.trail = []; 
        this.lastTouchedPlayer = null;
    }
}
