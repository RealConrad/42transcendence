import GlobalEventEmitter from "../../utils/EventEmitter.js";
import { EVENT_TYPES } from "../../utils/constants.js";

export class GameMenuDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.isTournamentMatch = false;
        this.gameData = null;
        this.isGameOver = false; // game or tournament is over
        this.winner = null;
    }

    connectedCallback() {
        this.render();
        this.close();
        this.setupListeners();

        GlobalEventEmitter.on(EVENT_TYPES.SHOW_GAME_MENU, this.showMenu.bind(this));
        GlobalEventEmitter.on(EVENT_TYPES.GAME_OVER, this.showGameOver.bind(this));
        this.shadowRoot.addEventListener("click", this.handleBackgroundClick.bind(this));
    }

    disconnectedCallback() {
        GlobalEventEmitter.off(EVENT_TYPES.SHOW_GAME_MENU, this.showMenu.bind(this));
        GlobalEventEmitter.off(EVENT_TYPES.GAME_OVER, this.showGameOver.bind(this));
        this.shadowRoot.removeEventListener("click", this.handleBackgroundClick.bind(this));
    }

    showGameOver({winner, isTournament = false}) {
        this.isGameOver = true;
        this.isTournamentMatch = isTournament;
        this.winner = winner;
        this.open();
    }

    updateTournamentData(gameData) {
        this.gameData = gameData;
        if (this.isTournamentMatch && this.style.display === "block") {
            this.render();
        }
    }

    showMenu({ isTournament }) {
       if (this.isGameOver) return;
       this.isTournamentMatch = isTournament;
       this.open();
    }

    open() {
        this.style.display = "block";
        this.render();
    }

    close() {
        this.isGameOver = false;
        this.style.display = "none";
        GlobalEventEmitter.emit(EVENT_TYPES.RESUME_GAME);
    }

    handleBackgroundClick(event) {
        if (event.target.id === "overlay" && !this.isGameOver) {
            this.close();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../../styles/dialog.css">
            <div id="overlay" class="overlay2">
                <div class="dialog2">
                    ${
                        this.isGameOver
                            ? `<div class="heading">${this.winner} won ${this.isTournamentMatch ? 'the Tournament' : 'the Game'}!</div>`
                            : `<div class="heading">Game Menu</div>`
                    }
                    ${
                        this.isGameOver
                            ? ''
                            : (
                                this.isTournamentMatch
                                    ? this.renderTournamentStandings()
                                    : `<div>Paused</div>`
                            )
                    }
                    ${
                        this.isGameOver
                            ? ''
                            : `<button id="resume-game" class="sign-in-button" style="width: 50%; margin-bottom: 20px;">Resume</button>`
                    }
                    <button id="quit-game" class="sign-in-button" style="width: 50%">Quit</button>
                </div>
            </div>
        `;
        this.setupListeners();
    }

    getPlayerClass(match, playerKey) {
        if (!match.winner) {
            return '';
        }
        if (match[playerKey] && match.winner.username === match[playerKey].username) {
            return 'winner';
        } else {
            return 'loser';
        }
    }
    truncateName(name) {
        const maxLength = 12;
        if (name.length > maxLength) {
            return name.substring(0, maxLength - 1) + '…';
        }
        return name;
    }

    renderTournamentStandings() {
        if (!this.gameData || !this.gameData.rounds) return `<div>No tournament data available.</div>`;
        return `
            <div class="tournament-standings">
                ${this.gameData.rounds
                    .map(
                        (round, roundIndex) => `
                        <div class="round">
                            <div class="round-heading">Round ${roundIndex + 1}</div>
                            ${round
                                .map(
                                    (match) => `
                                <div class="match-box">
                                    <div class="match">
                                        <span class="player-name ${this.getPlayerClass(match, 'player1')}" title="${match.player1 ? match.player1.username : "TBD"}">
                                            ${this.truncateName(match.player1 ? match.player1.username : "TBD")}
                                        </span>
                                        <span class="score ${this.getPlayerClass(match, 'player1')}">
                                            ${match.player1Score !== undefined ? match.player1Score.toString().padStart(4, ' ') : '   -'}
                                        </span>
                                        <span class="vs">vs</span>
                                        <span class="score ${this.getPlayerClass(match, 'player2')}">
                                            ${match.player2Score !== undefined ? match.player2Score.toString().padStart(4, ' ') : '-   '}
                                        </span>
                                        <span class="player-name ${this.getPlayerClass(match, 'player2')}" title="${match.player2 ? match.player2.username : "TBD"}">
                                            ${this.truncateName(match.player2 ? match.player2.username : "TBD")}
                                        </span>
                                    </div>
                                </div>
                            `
                                )
                                .join("")}
                        </div>
                    `
                    )
                    .join("")}
            </div>
        `;

    }

    setupListeners() {
        const resumeButton = this.shadowRoot.querySelector("#resume-game");
        if (resumeButton) {
            resumeButton.addEventListener("click", () => {
                this.close();
            });
        }
        this.shadowRoot.querySelector("#quit-game").addEventListener("click", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.QUIT_GAME);
            this.close();
        });
    }
}

customElements.define("game-menu-dialog", GameMenuDialog);
