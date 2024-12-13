import {EVENT_TYPES, USER} from "../../utils/constants.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {getAccessToken, showToast, validateInput} from "../../api/api.js";

export class GameSetupDialog extends HTMLElement {
    constructor() {
        super();
        this.matchType = null;
        this.attachShadow({ mode: 'open' });
        this.displayname = USER.displayname;
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
                            ${!getAccessToken() ? `
                                    <label for="player1-name">Player 1 Name:</label>
                                    <input type="text" id="player1-name" placeholder="Enter Player 1 Name" />
                                ` : ""}
                        </div>
                        ${
                            this.matchType === "local"
                                ? `
                                <div class="group">
                                    <label for="player2-name">Player 2 Name:</label>
                                    <input type="text" id="player2-name" placeholder="Enter Player 2 Name" />
                                </div>   
                            `
                                : `
                                <div>
                                    <label for="ai-difficulty-slider">AI Difficulty: <span id="difficulty-value">5</span></label>
                                    <input type="range" class="ai-difficulty-slider" id="ai-difficulty-slider" min="1" max="10" step="1" value="5">
                                </div>
                                `
                        }
                    </div>
                    <div class="player-input" style="padding-top: 20px;">
                        <label>
                            <input type="checkbox" id="enable-powerups">
                            Enable Powerups
                        </label>
                        <div class="powerup-count">
                            <label for="powerup-count-slider">Powerup Count: <span id="powerup-count">4</span></label>
                            <input type="range" class="powerup-count-slider" id="powerup-count-slider" min="1" max="10" step="1" value="4" disabled>
                        </div>
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
        this.setupEventListeners();
    }

    setMatchType(matchType) {
        this.matchType = matchType;
        this.render();
    }

    setupEventListeners() {
        const overlay = this.shadowRoot.getElementById("overlay");
        const closeButton = this.shadowRoot.getElementById("close-dialog-button");
        const startButton = this.shadowRoot.getElementById("start-game-button");

        const checkbox = this.shadowRoot.getElementById('enable-powerups');
        const slider = this.shadowRoot.getElementById('powerup-count-slider');
        const difficultyValue = this.shadowRoot.getElementById('powerup-count');

        if (overlay) {
            overlay.addEventListener("click", (e) => {
                if (e.target.id === "overlay") {
                    this.close();
                }
            });
        }

        checkbox.addEventListener("change", () => {
            slider.disabled = !checkbox.checked;
            if (!checkbox.checked) difficultyValue.textContent = "5";
        });

        slider.addEventListener("input", () => {
            difficultyValue.textContent = slider.value;
        });

        const AIDifficultySlider = this.shadowRoot.querySelector("#ai-difficulty-slider");
        if (AIDifficultySlider) {
            AIDifficultySlider.addEventListener('change', () => {
                const difficultyValue = this.shadowRoot.querySelector("#difficulty-value");
                difficultyValue.textContent = AIDifficultySlider.value;
            });

        }
        closeButton.addEventListener("click", () => {
            this.close();
        });
        //here change displayname
        startButton.addEventListener("click", () => {
            let player1Name = this.shadowRoot.querySelector("#player1-name")?.value?.trim();
            if (USER.username) {
                player1Name = this.displayname;
            }
            const player2Name = this.matchType === "local"
                ? this.shadowRoot.querySelector("#player2-name").value.trim()
                : "AI";

            try {
                validateInput(player1Name);
                validateInput(player2Name);
                let powerUpCount = 0;
                if (checkbox.checked)
                    powerUpCount = slider.value;
                const matchType = this.matchType;
                const AIDifficulty = AIDifficultySlider ? AIDifficultySlider.value : null;
                GlobalEventEmitter.emit(EVENT_TYPES.START_MATCH, { player1Name, player2Name, matchType, AIDifficulty, powerUpCount });
                this.close();
            } catch (error) {
                showToast(error, 'danger');
            }
        });
    }
}

customElements.define("game-setup-dialog", GameSetupDialog);
