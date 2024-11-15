import Controller from "./Controller.js";

export default class AIController extends Controller{
    constructor(paddle, ball) {
        super(paddle);
        this.ball = ball;
    }

    update() {
        // TODO: MAKE AI BETTER? IDK HOW YET, THIS JUST MOVES TOWARDS BALL
        const paddleCenter = this.paddle.y + this.paddle.height / 2;
        if (this.ball.y < paddleCenter) {
            this.paddle.dy = -5;
        } else if (this.ball.y > paddleCenter) {
            this.paddle.dy = 5;
        } else {
            this.paddle.dy = 0;
        }
        this.paddle.move();
    }
}