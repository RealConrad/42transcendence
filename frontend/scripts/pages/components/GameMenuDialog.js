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
            <style>
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .dialog {
                padding: 20px;
                border-radius: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 50%;
                max-width: 600px;
                height: 100%;
                max-height: 560px;
                min-width: 300px;
                min-height: 500px;
                background: var(--background-yellow);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                font-size: 1rem;
                color: #333;
                box-sizing: border-box;
            }

            /*SUPER MESSY I KNOW - ONLY DIFFERENCE IS BIGGER DIMENSIONS -- DONT HAVE TIME TO IMPLEMENT BETTER SOLUTION
            THIS IS USED ON GAME MENU DIALOG
            */
            .overlay2 {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .dialog2 {
                padding: 20px;
                border-radius: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 50%;
                max-width: 600px;
                height: 100%;
                max-height: 600px;
                min-width: 400px;
                min-height: 400px;
                background: var(--background-yellow);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                font-size: 1rem;
                color: #333;
                box-sizing: border-box;
            }

            button {
                all: unset;
            }

            .heading {
                font-size: 2rem;
                margin-bottom: 20px;
            }

            .login {
                width: 100%;
                text-align: center;
            }

            .flex-container {
                display: flex;
                justify-content: center;
                margin-bottom: 10px;
            }

            .group {
                width: 100%;
                max-width: 500px;
            }

            .label {
                margin-bottom: 5px;
                font-size: 1.2rem;
                text-align: left;
            }

            .input-field {
                padding: 10px;
                font-size: 1rem;
                width: 100%;
                border: 1px solid #ccc;
                border-radius: 5px;
            }

            input {
                outline: none;
            }

            .sign-in-button {
                width: 100%;
                padding: 10px;
                background-color: black;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 1.2rem;
            }

            .sign-in-button:hover {
                background-color: #333;
            }

            .account-links {
                margin-top: 10px;
                font-size: 0.9rem;
                color: #333;
                margin-bottom: 30px;
                font-family: monospace;
            }

            .account-links a {
                color: blue;
                text-decoration: none;
            }

            .account-links a:hover {
                text-decoration: underline;
            }

            .margin-top {
                margin-top: 30px;
            }

            .auth-button {
                margin-top: 10px;
                width: 100%;
                padding: 10px;
                background-color: black;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 1.2rem;
            }

            .auth-button:hover {
                background-color: #333;
            }

            .register {
                text-align: center;
                width: 100%;
            }

            .otp {
                text-align: center;
                width: 100%;
            }

            .error-message {
                color: red;
                font-size: 0.9rem;
                height: 15px; /* Fixed height to reserve space */
                margin-top: 5px;
                text-align: left;
                visibility: hidden; /* Hidden by default, made visible when an error occurs */
            }

            .otp-input-container {
                display: flex;
                justify-content: center;
                gap: 10px;
            }

            .otp-box {
                width: 40px;
                height: 40px;
                text-align: center;
                font-size: 18px;
                border: 1px solid #ccc;
                border-radius: 5px;
            }

            #qr-code {
                width: 200px;
                height: 200px;
                border-radius: 15px;
                border: 2px solid #000;
                margin: 20px auto;
                object-fit: contain;
            }

            .player-input {
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
                padding-left: 15px; /* Must Match the remove button's offset */
            }

            #player-inputs {
                padding-left: 20px;
            }

            .player-input input[type="text"] {
                flex: 1;
            }

            .player-input label {
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .player-inputs {
                max-height: 500px;
                width: 500px;
                overflow-y: auto;
            }

            .remove-player-button {
                position: absolute;
                left: -10px;
                background: #ff4d4d;
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 50%;
                font-size: 0.5rem;
                line-height: 1;
            }

            .remove-player-button:hover {
                background: #e60000;
            }

            .ai-difficulty {
                margin-top: 10px;
                margin-right: 5px;
            }

            .ai-difficulty label {
                font-size: 0.5rem;
            }

            #ai-difficulty-slider {
                width: 100%;
            }

            .disclaimer {
                font-size: 0.4rem;
                text-align: right;
            }

            .round-heading {
                text-align: left;
                font-weight: bold;
                margin-top: 10px;
            }
            .match-box {
                background-color: #f0f0f0;
                margin: 5px 0;
                padding: 5px;
                border-radius: 5px;
            }
            .match {
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: monospace; /* Monospace font for consistent character widths */
            }
            .player-name {
                width: 110px;
                text-align: center;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .score {
                width: 40px;
                text-align: center;
            }
            .vs {
                width: 30px;
                text-align: center;
            }
            .winner {
                color: green;
                font-weight: bold;
            }
            .loser {
                color: red;
            }
            .tournament-standings {
                margin-top: 10px;
                max-height: 500px;
                overflow-y: auto;
            }
            </style>
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
            GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
            this.close();
        });
    }
}

customElements.define("game-menu-dialog", GameMenuDialog);
