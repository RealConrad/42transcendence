import GlobalEventEmitter from "../../utils/EventEmitter.js";
import { EVENT_TYPES } from "../../utils/constants.js";

export class GameMenuDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.tournamentData = [];
        this.isTournamentMatch = false;
    }

    connectedCallback() {
        this.render();
        this.registerTournamentListener();
    }

    disconnectedCallback() {
        GlobalEventEmitter.off(EVENT_TYPES.TOURNAMENT_UPDATE, this.updateTournamentData);
        GlobalEventEmitter.off(EVENT_TYPES.START_TOURNAMENT, this.updateMatchType);
    }

    open() {
        this.shadowRoot.display = 'block';
    }
    close() {
        this.shadowRoot.display = 'none';
    }

    registerTournamentListener() {
        this.updateTournamentData = this.updateTournamentData.bind(this);

        GlobalEventEmitter.on(EVENT_TYPES.TOURNAMENT_UPDATE, this.updateTournamentData);
        GlobalEventEmitter.on(EVENT_TYPES.START_TOURNAMENT, this.updateMatchType);
    }

    updateTournamentData(data) {
        this.tournamentData = data.rounds;
        this.render();
    }

    updateMatchType({ isTournamentMatch }) {
        this.isTournamentMatch = isTournamentMatch;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    html() {
        return `
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
    }

    renderTournamentStandings() {
        return `
            <div class="tournament-standings">
                ${this.tournamentData
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
}
customElements.define("game-menu-dialog", GameMenuDialog);