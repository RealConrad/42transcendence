import GlobalEventEmitter from "../../utils/EventEmitter.js";
import { EVENT_TYPES } from "../../utils/constants.js";

export class GameMenuDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.isTournamentMatch = false;
    }

    connectedCallback() {
        this.render();
        this.close();
        this.setupListeners();

        GlobalEventEmitter.on(EVENT_TYPES.SHOW_GAME_MENU, this.showMenu.bind(this));
        this.shadowRoot.addEventListener("click", this.handleBackgroundClick.bind(this));
    }

    disconnectedCallback() {
        GlobalEventEmitter.off(EVENT_TYPES.SHOW_GAME_MENU, this.showMenu.bind(this));
        this.shadowRoot.removeEventListener("click", this.handleBackgroundClick.bind(this));
    }

    showMenu({ isTournamentMatch }) {
        this.isTournamentMatch = isTournamentMatch;
        this.open();
    }

    open() {
        this.style.display = "block";
        this.render();
    }

    close() {
        this.style.display = "none";
        GlobalEventEmitter.emit(EVENT_TYPES.RESUME_GAME);
    }

    handleBackgroundClick(event) {
        if (event.target.id === "overlay") {
            this.close();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../../styles/dialog.css">
            <div id="overlay" class="overlay">
                <div class="dialog">
                    <div class="heading">Game Menu</div>
                    ${
                        this.isTournamentMatch
                            ? this.renderTournamentStandings()
                            : `<div>Paused</div>`
                    }
                    <button id="resume-game" class="sign-in-button">Resume</button>
                </div>
            </div>
        `;
        this.setupListeners();
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
                                <div class="match">
                                    <span>${match.player1.username}</span> vs 
                                    <span>${match.player2.username}</span>
                                    ${
                                        match.winner
                                            ? `<span class="winner">Winner: ${match.winner.username}</span>`
                                            : ""
                                    }
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
        this.shadowRoot.querySelector("#resume-game").addEventListener("click", () => {
            this.close();
        });
    }
}

customElements.define("game-menu-dialog", GameMenuDialog);
