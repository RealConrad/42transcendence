import {EVENT_TYPES} from "../../utils/constants.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";

export class GameSetupDialog extends HTMLElement {
    constructor() {
        super();
        this.matchType = null;
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.close(); // Start with the dialog closed
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/dialog.css">
            <div id="overlay" class="overlay">
                <div class="dialog">
                    <div class="heading">Game Setup</div>
                    <div class="flex-container">
                        <div class="group">
                            <label for="player1-name">Player 1 Name:</label>
                            <input type="text" id="player1-name" placeholder="Enter Player 1 Name" />
                        </div>
                        ${
                            this.matchType === "local"
                                ? `
                        <div class="group">
                            <label for="player2-name">Player 2 Name:</label>
                            <input type="text" id="player2-name" placeholder="Enter Player 2 Name" />
                        </div>
                        `
                                : ""
                        }
                    </div>
                    <button id="start-game-button" style="margin-bottom: 20px" class="sign-in-button">Start Game</button>
                    <button id="close-dialog-button" class="sign-in-button">Cancel</button>
                </div>
            </div>
        `;
    }

    open() {
        this.style.display = "block";
    }

    close() {
        this.style.display = "none";
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners(); // Attach listeners after rendering
    }

    setMatchType(matchType) {
        this.matchType = matchType;
        this.render(); // Re-render when matchType changes
    }

    setupEventListeners() {
        const overlay = this.shadowRoot.getElementById("overlay");
        const closeButton = this.shadowRoot.getElementById("close-dialog-button");
        const startButton = this.shadowRoot.getElementById("start-game-button");

        if (overlay) {
            overlay.addEventListener("click", (e) => {
                if (e.target.id === "overlay") {
                    this.close();
                }
            });
        }

        closeButton.addEventListener("click", () => {
            this.close();
        });
        startButton.addEventListener("click", () => {
            const player1Name = this.shadowRoot.querySelector("#player1-name").value.trim();
            const player2Name = this.matchType === "local"
                ? this.shadowRoot.querySelector("#player2-name").value.trim()
                : "AI";

            if (player1Name && player2Name) {
                console.log(`${player1Name} vs ${player2Name}`);
                const type = this.matchType;
                GlobalEventEmitter.emit(EVENT_TYPES.START_MATCH, { player1Name, player2Name, type });
                this.close();
            } else {
                alert("Enter all player names");
            }
        });
    }
}

customElements.define("game-setup-dialog", GameSetupDialog);
