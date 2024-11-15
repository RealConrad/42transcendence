/**
 * Handles state of game, including tracking scores, game over conditions
 */
export default class GameState {
    constructor(player1, player2, ball, maxScore = 10) {
        this.player1 = player1;
        this.player2 = player2;
        this.ball = ball;
        this.isGameOver = false;
        this.maxScore = maxScore;
    }

    checkGameOver() {
        if (this.player1.score === this.maxScore || this.player2.score === this.maxScore)
            this.isGameOver = true;
    }

    reset() {
        this.player1.resetScore();
        this.player2.resetScore();
        this.ball.reset();
        this.isGameOver = false;
    }
}
