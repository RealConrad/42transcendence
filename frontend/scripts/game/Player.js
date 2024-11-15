export default class Player {
    constructor(username) {
        this.username = username
        this.score = 0;
        this.paddle = null;
    }

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }
}
