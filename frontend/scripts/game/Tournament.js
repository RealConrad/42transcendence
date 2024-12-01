import Game from "./Game.js"
import GlobalEventEmitter from "../utils/EventEmitter.js";
import {EVENT_TYPES} from "../utils/constants.js";

export default class Tournament {
    constructor(players, canvas) {
        if (players.length < 4) {
            throw new Error("Tournament must have at least 4 players");
        }
        this.canvas = canvas;
        this.players = players; // Array of { username, isAI, aiDifficulty }
        this.currentRound = [];
        this.winners = [];
        this.matches = [];
        this.currentMatchIndex = 0;
        this.numberOfRounds = 0;
    }

    start() {
        this.init();
        this.startNextMatch();
    }

    init() {
        const shuffledPlayers = this.shufflePlayers([...this.players]);

        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            const match = {
                player1: shuffledPlayers[i],
                player2: shuffledPlayers[i + 1],
                round: 0,
                winner: null,
            }
            this.currentRound.push(match);
        }
        this.matches.push(this.currentRound);
    }

    // Credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shufflePlayers(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async startNextMatch() {
        if (this.currentMatchIndex >= this.currentRound.length) {
            console.log("All matches have been played for this round");
            this.prepareNextRound();
            return;
        }
        const match = this.currentRound[this.currentMatchIndex];
        console.log(`Starting match: ${match.player1.username} vs ${match.player2.username}`);
        const winner = await this.playMatch(match);
        match.winner = winner;
        this.winners.push(winner);
        this.currentMatchIndex++;
        this.startNextMatch();
    }

    playMatch(match) {
        return new Promise((resolve) => {
            if (match.player1.isAI && match.player2.isAI) {
                console.warn("Both players are AI - skipping this match...");
                const winner = Math.random() < 0.5 ? match.player1 : match.player2;
                resolve(winner);
            }
            const game = new Game(
                this.canvas,
                match.player1,
                match.player2,
                true,
            )

            const checkGameOver = () => {
                if (game.isGameOver) {
                    const winner = game.getWinner();
                    resolve(winner);
                } else {
                    requestAnimationFrame(checkGameOver);
                }
            }
            game.updatePlayerScore();
            game.start();
            checkGameOver();
        })
    }

    prepareNextRound() {
        this.numberOfRounds++;
        if (this.winners.length === 1) {
            console.log(`${this.winners[0].username} won the Tournament!`);
            console.log("COMPLETE MATCHES: ", this.matches);

            return;
        }
        console.log("=====Advancing to next round=====");
        this.currentRound = [];
        this.matches.push(this.currentRound);
        for (let i = 0; i < this.winners.length; i += 2) {
            const match = {
                player1: this.winners[i],
                player2: this.winners[i + 1],
                winner: null,
                round: this.numberOfRounds,
            };
            this.currentRound.push(match);
        }
        this.winners = [];
        this.currentMatchIndex = 0;
        console.log("NEW ROUND: ", this.currentRound);
        GlobalEventEmitter.emit(EVENT_TYPES.TOURNAMENT_UPDATE, {rounds: this.matches});
        this.startNextMatch();
    }

    resetTournament() {
        this.currentRound = [];
        this.winners = [];
        this.matches = [];
        this.currentMatchIndex = 0;
        this.numberOfRounds = 0;
    }
}
