export default class Player {
    constructor(username, paddle, controller) {
        this.username = username
        this.score = 0;
        this.paddle = paddle;
        this.controller = controller;
    }

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }
}
