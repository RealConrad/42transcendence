export default class Player {
    constructor(username, paddle, controller) {
        this.username = username;
        this.score = 0;
        this.paddle = paddle;
        this.controller = controller;
        this.atkPowerUp = null;
        this.defPowerUp = null; //
    }
    

    incrementScore() {
        this.score += 1;
    }

    resetScore() {
        this.score = 0;
    }


    drawInventory(ctx, x, y) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(x, y, 60, 60);
    
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "16px Arial";
        ctx.fillText(this.atkPowerUp ? this.atkPowerUp.symbol : "ATK", x + 30, y + 30);
    
        ctx.strokeRect(x, y + 70, 60, 60);
        ctx.fillText(this.defPowerUp ? this.defPowerUp.symbol : "DEF", x + 30, y + 100);
    
        ctx.globalAlpha = 1;
    }
    

    addPowerUp(powerUp) {
        if (powerUp.type === "ATK") {
            this.atkPowerUp = powerUp;
        } else if (powerUp.type === "DEF") {
            this.defPowerUp = powerUp;
        }
        console.log(`${this.username} collected ${powerUp.type}: ${powerUp.symbol}`);
    }
    
    removePowerUp(powerUpToRemove) {
        this.powerUps = this.powerUps.filter((powerUp) => powerUp !== powerUpToRemove)
    }
}
