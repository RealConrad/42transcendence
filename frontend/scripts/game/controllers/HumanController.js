import Controller from "./Controller.js";

export default class HumanController extends Controller {
    constructor(paddle, upKey, downKey, inputManager) {
        super(paddle);
        this.upKey = upKey;
        this.downKey = downKey;
        this.inputManager = inputManager;
        this.ai = false;
    }

    update() {
        if (this.inputManager.isKeyPressed(this.upKey)) {
            this.paddle.dy = -this.paddle.speed;
        } else if (this.inputManager.isKeyPressed(this.downKey)) {
            this.paddle.dy = this.paddle.speed;
        } else {
            this.paddle.dy = 0;
        }
        this.paddle.move();
    }
}
