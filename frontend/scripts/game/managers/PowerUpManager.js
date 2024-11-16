export default class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.activePowerUps = [];
        this.powerUpSpawnFrequency = 10000; // 10s
        this.lastSpawnTime = Date.now();
    }

    spawnPowerUp() {

    }
}