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
        this.bracket = []; // Array of rounds, each round is an array of matches
        this.currentRoundIndex = 0;
        this.currentMatchIndex = 0;
        this.isTournamentOver = false;
        GlobalEventEmitter.on(EVENT_TYPES.QUIT_GAME, this.quitTournament.bind(this));
    }

    start() {
        this.generateBracket();
        this.startNextMatch();
    }

    quitTournament() {
        this.isTournamentOver = true;
    }

    // Credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shufflePlayers(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generateBracket() {
        const shuffledPlayers = this.shufflePlayers([...this.players]);
        const numRounds = Math.log2(shuffledPlayers.length);
        for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
            this.bracket.push([]);
            const numMatches = Math.pow(2, numRounds - roundIndex - 1);
            for (let matchIndex = 0; matchIndex < numMatches; matchIndex++) {
                this.bracket[roundIndex].push({
                    player1: null,
                    player2: null,
                    winner: null,
                    round: roundIndex,
                });
            }
        }

        // Assign players to first round matches
        const firstRoundMatches = this.bracket[0];
        for (let i = 0; i < shuffledPlayers.length; i++) {
            const matchIndex = Math.floor(i / 2);
            if (i % 2 === 0) {
                firstRoundMatches[matchIndex].player1 = shuffledPlayers[i];
            } else {
                firstRoundMatches[matchIndex].player2 = shuffledPlayers[i];
            }
        }
    }

    async startNextMatch() {
        if (this.isTournamentOver)
            return;
        GlobalEventEmitter.emit(EVENT_TYPES.TOURNAMENT_UPDATE, { rounds: this.bracket });
        const currentRound = this.bracket[this.currentRoundIndex];
        if (!currentRound || this.currentMatchIndex >= currentRound.length) {
            // Move to next round
            this.currentRoundIndex++;
            this.currentMatchIndex = 0;
            if (this.currentRoundIndex >= this.bracket.length) {
                // TODO: CREATE API AND SAVE TOURNAMENT MATCHES
                const champion = this.bracket[this.bracket.length - 1][0].winner;
                console.log(`${champion.username} won the Tournament!`);
                GlobalEventEmitter.emit(EVENT_TYPES.GAME_OVER, { winner: champion.username, isTournament: true });
                console.log(this.bracket);
                return;
            } else {
                GlobalEventEmitter.emit(EVENT_TYPES.TOURNAMENT_UPDATE, { rounds: this.bracket });
                this.startNextMatch();
                return;
            }
        }

        const match = currentRound[this.currentMatchIndex];

        // If both players are null, this match is not ready yet
        if (!match.player1 || !match.player2) {
            console.log(`Match ${this.currentMatchIndex + 1} in Round ${this.currentRoundIndex + 1} is not ready.`);
            this.currentMatchIndex++;
            this.startNextMatch();
            return;
        }

        console.log(`Starting match: ${match.player1.username} vs ${match.player2.username}`);
        const winner = await this.playMatch(match);
        match.winner = winner;

        // Assign winner to the next round
        if (this.currentRoundIndex + 1 < this.bracket.length) {
            const nextRoundMatchIndex = Math.floor(this.currentMatchIndex / 2);
            const nextMatch = this.bracket[this.currentRoundIndex + 1][nextRoundMatchIndex];
            if (this.currentMatchIndex % 2 === 0) {
                nextMatch.player1 = winner;
            } else {
                nextMatch.player2 = winner;
            }
        }

        this.currentMatchIndex++;
        this.startNextMatch();
    }

    playMatch(match) {
        return new Promise((resolve) => {
            if (match.player1.isAI && match.player2.isAI) {
                console.warn("Both players are AI - randomly selecting a winner...");
                const winner = Math.random() < 0.5 ? match.player1 : match.player2;
                // TODO: CREATE RANDOM SCORES??
                resolve(winner);
                return;
            }

            const game = new Game(
                this.canvas,
                match.player1,
                match.player2,
                true,
            );

            const checkGameOver = () => {
                if (game.isGameOver) {
                    const winner = game.getWinner();
                    match.player1.score = winner.player1Score;
                    match.player2.score = winner.player2Score;
                    match.player1Score = winner.player1Score;
                    match.player2Score = winner.player2Score;
                    resolve(winner);
                } else {
                    requestAnimationFrame(checkGameOver);
                }
            };
            game.start();
            checkGameOver();
        });
    }

    resetTournament() {
        this.matches = [];
        this.currentMatchIndex = 0;
    }
}
