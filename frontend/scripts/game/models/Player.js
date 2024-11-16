export default class Player {
    constructor(username, paddle, controller) {
        this.username = username;
        this.score = 0;
        this.paddle = paddle;
        this.controller = controller;
        this.powerUps = [];
    }

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }

    addPowerUp(powerUp) {
        if (this.powerUps.length === 2) {
            console.log(`${this.username}'s power up storage is full!`);
            return;
        }
        this.powerUps.add(powerUp);
    }
    removePowerUp(powerUpToRemove) {
        this.powerUps = this.powerUps.filter((powerUp) => powerUp !== powerUpToRemove)
    }
}
