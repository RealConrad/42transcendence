export default class Controller {
    constructor(paddle) {
        this.paddle = paddle;
    }

    update() {
        throw new Error("update() must be defined in sub class");
    }
}