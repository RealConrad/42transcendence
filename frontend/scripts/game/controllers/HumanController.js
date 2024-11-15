import Controller from "./Controller.js";

export default class HumanController extends Controller {
    constructor(paddle, upKey, downKey) {
        super(paddle);
        this.upKey = upKey;
        this.downKey = downKey;
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleInput();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.handleInput();
        });
    }

    handleInput() {
        if (this.keys[this.upKey])
            this.paddle.dy = -this.paddle.speed;
        else if (this.keys[this.downKey])
            this.paddle.dy = this.paddle.speed;
        else
            this.paddle.dy = 0;
    }

    update() {
        this.paddle.move();
    }
}