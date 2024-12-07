import Controller from "./Controller.js";

export default class AIController extends Controller{
    constructor(paddle, ball, difficulty, canvas) {
        super(paddle);
        this.canvas = canvas
        this.ball = ball;
        this.lastSnapshot = {
            x: this.ball.x,
            y: this.ball.y,
            speedX: this.ball.speedX,
            speedY: this.ball.speedY
        };
        this.startSnapshot();
        this.difficulty = difficulty;
        this.ai = true;
    }

    startSnapshot() {
        setInterval(() => {
            this.lastSnapshot = {
                x: this.ball.x,
                y: this.ball.y,
                speedX: this.ball.speedX,
                speedY: this.ball.speedY
            };
        }, 1000);
    }

    predictBallPosition(difficulty = 3) {
        if (!this.lastSnapshot) return this.ball.y;

        let predictedX = this.lastSnapshot.x;
        let predictedY = this.lastSnapshot.y;
        let predictedSpeedX = this.lastSnapshot.speedX;
        let predictedSpeedY = this.lastSnapshot.speedY;
        difficulty = Math.max(1, difficulty) * 20;

        let steps = 0;
        while (predictedX > this.ball.radius && predictedX < this.canvas.width - this.ball.radius && steps < difficulty) {
            predictedX += predictedSpeedX;
            predictedY += predictedSpeedY;
            steps++;

            if (predictedY <= this.ball.radius || predictedY >= this.canvas.height - this.ball.radius) {
                predictedSpeedY = -predictedSpeedY;
            }
        }

        if (steps < difficulty) {
            return this.implementStrategy(predictedY);
        }

        return predictedY;
    }

    implementStrategy(predictedY) {
        const paddleCenter = this.paddle.y + this.paddle.height / 2;
        const gameCenter = this.canvas.height / 2;
        const gameTop = gameCenter + this.canvas.height / 4;
        const gameBottom = gameCenter - this.canvas.height / 4;

        if (this.paddle.y > gameTop) {
            predictedY -= this.paddle.height / 3;
        } else if (this.paddle.y > gameCenter) {
            predictedY += this.paddle.height / 3;
        } else if (this.paddle.y < gameBottom) {
            predictedY += this.paddle.height / 3;
        } else {
            predictedY -= this.paddle.height / 3;
        }

        return predictedY;
    }


    update() {
        const predictedY = this.predictBallPosition(this.difficulty);
        const paddleCenter = this.paddle.y + this.paddle.height / 2;

        if (predictedY < paddleCenter) {
            this.paddle.dy = -this.paddle.speed;
        } else if (predictedY > paddleCenter) {
            this.paddle.dy = this.paddle.speed;
        } else {
            this.paddle.dy = 0;
        }
        this.paddle.move();
    }
}