import Game from "./Game.js"

export default class Tournament {
    constructor(players, canvas) {
        if (players.length < 4) {
            throw new Error("Tournament must have at least 4 players");
        }
        this.canvas = canvas;
        this.players = players; // Array of { name, isAI }
        this.currentRound = [];
        this.winners = [];
        this.matches = [];
        this.currentMatchIndex = 0;
        this.numberOfRounds = 0;
    }

    start() {
        this.init();
        console.log("ALL MATCHES: ", this.matches);
        console.log("Tournament Initialized");
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

    shufflePlayers(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startNextMatch() {
        if (this.currentMatchIndex >= this.currentRound.length) {
            console.log("All matches have been played for this round");
            this.prepareNextRound();
            return;
        }
        const match = this.currentRound[this.currentMatchIndex];
        console.log(`Starting match: ${match.player1.name} vs ${match.player2.name}`);
        this.playMatch(match, (winner) => {
            console.log("Match winner: ", winner.name);
            match.winner = winner;
            this.winners.push(winner);
            this.currentMatchIndex++;
            this.startNextMatch();
        });
    }

    playMatch(match, callback) {
        if (match.player1.isAI && match.player2.isAI) {
            console.warn("Both players are AI - skipping this match...");
            const winner = Math.random() < 0.5 ? match.player1 : match.player2;
            callback(winner);
            return;
        }
        const game = new Game(
            this.canvas,
            match.player2.isAI,
            match.player1.name,
            match.player2.name
        )
        // game.start();

        // testing:
        setTimeout(() => {
            const winner = Math.random() < 0.5 ? match.player1 : match.player2;
            callback(winner);
        }, 3000);
    }

    prepareNextRound() {
        this.numberOfRounds++;
        if (this.winners.length === 1) {
            console.log(`${this.winners[0].name} won the tournament!`);
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
        this.startNextMatch();
    }
}
