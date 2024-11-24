import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../utils/constants.js";
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

        // Create a container for the ball's trail
        this.trailContainer = document.createElement('div');
        this.trailContainer.className = 'ball-trail-container';
        document.body.appendChild(this.trailContainer);

        // Create the ball element
        this.ballElement = document.createElement('div');
        this.ballElement.className = 'ball';
        this.updateBallPosition();
        document.body.appendChild(this.ballElement);
    }

    updateBallPosition() {
        const canvas = document.getElementById('pongCanvas');
        const canvasScaleX = parseFloat(canvas.style.width) / canvas.width;
        const canvasScaleY = parseFloat(canvas.style.height) / canvas.height;
    
        this.ballElement.style.left = `${(this.x - this.radius) * canvasScaleX + 100}px`;
        this.ballElement.style.top = `${(this.y - this.radius) * canvasScaleY}px`;
        this.ballElement.style.width = `${this.radius * 2 * canvasScaleX}px`;
        this.ballElement.style.height = `${this.radius * 2 * canvasScaleY}px`;
    }
    
    move() {
        const canvas = document.getElementById('pongCanvas');
        const canvasScaleX = parseFloat(canvas.style.width) / canvas.width;
        const canvasScaleY = parseFloat(canvas.style.height) / canvas.height;
    
        // Tworzenie elementu trail
        const trail = document.createElement('div');
        trail.className = 'cursor-after-image';
        trail.style.left = `${(this.x - this.radius) * canvasScaleX + 100}px`;
        trail.style.top = `${(this.y - this.radius) * canvasScaleY}px`;
        trail.style.width = `${this.radius * 2 * canvasScaleX}px`;
        trail.style.height = `${this.radius * 2 * canvasScaleY}px`;
        this.trailContainer.appendChild(trail);
    
        // Usuwanie traila po krótkim czasie
        setTimeout(() => {
            this.trailContainer.removeChild(trail);
        }, 100);
    
        // Aktualizacja pozycji kulki
        this.x += this.speedX;
        this.y += this.speedY;
        this.updateBallPosition();
    }
    

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }

    reset() {
        this.x = this.initialX;
        this.y = this.initialY;
        this.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
    }
}
