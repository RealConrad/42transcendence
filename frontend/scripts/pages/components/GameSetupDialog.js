import {EVENT_TYPES} from "../../utils/constants.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {getAccessToken, showToast, validateInput} from "../../api/api.js";

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
        startButton.addEventListener("click", () => {
            let player1Name = this.shadowRoot.querySelector("#player1-name")?.value?.trim();
            if (localStorage.getItem("username")) {
                player1Name = localStorage.getItem("username");
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
