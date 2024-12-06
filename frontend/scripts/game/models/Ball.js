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


    // to be fixed

    // celebrate(ctx) {
    //     const colors = ["red", "green", "blue"];
    //     const particles = 20;
    //     let x = this.x;
    //     let y = this.y;
    //     for (let i = 0; i < particles; i++) {
    //         const size = this.radius * (1.5 + Math.random());
    //         const angle = Math.random() * Math.PI * 2;
    //         const speed = 5 + Math.random() * 5;
    //         const vx = Math.cos(angle) * speed;
    //         const vy = Math.sin(angle) * speed;
    //         const color = colors[Math.floor(Math.random() * colors.length)];
    
    //         const animate = () => {
    //             ctx.fillStyle = "red";
    //             ctx.globalAlpha = 1;
    //             ctx.beginPath();
    //             ctx.rect(x, y, size, size);
    //             ctx.fill();
    //             ctx.closePath();
    
    //             x += vx;
    //             y += vy;
    //         };
    
    //         for (let t = 0; t < 60; t++) {
    //             setTimeout(animate, t * 16); // 16ms ≈ 60 FPS
    //         }
    //     }
    // }
    


    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.speedX = 1 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = 1 * (Math.random() > 0.5 ? 1 : -1);
        this.trail = []; 
        this.lastTouchedPlayer = null;
    }
}
