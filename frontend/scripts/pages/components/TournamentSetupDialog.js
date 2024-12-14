import {showToast, validateInput} from "../../api/api.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class TournamentSetupDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // TODO: Get from localstorage
        this.username = localStorage.getItem("username");
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.close();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
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
                    <div class="heading">Tournament Setup</div>
                    <div id="player-inputs" class="player-inputs">
                        <div class="player-input">
                            <input type="text" placeholder="Player 1 (You)" value="${this.username}">
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 2" value="Player 2">
                            <label>
                                <input type="checkbox" id="ai-checkbox-2">
                                AI
                            </label>
                            <div class="ai-difficulty">
                                <label for="ai-difficulty-slider-2">Difficulty: <span id="difficulty-value-2">5</span></label>
                                <input type="range" class="ai-difficulty-slider" id="ai-difficulty-slider-2" min="1" max="10" step="1" value="5" disabled>
                            </div>
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 3" value="Player 3">
                            <label>
                                <input type="checkbox" id="ai-checkbox-3">
                                AI
                            </label>
                            <div class="ai-difficulty">
                                <label for="ai-difficulty-slider-3">Difficulty: <span id="difficulty-value-3">5</span></label>
                                <input type="range" class="ai-difficulty-slider" id="ai-difficulty-slider-3" min="1" max="10" step="1" value="5" disabled>
                            </div>
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 4" value="Player 4">
                            <label>
                                <input type="checkbox" id="ai-checkbox-4">
                                AI
                            </label>
                            <div class="ai-difficulty">
                                <label for="ai-difficulty-slider-4">Difficulty: <span id="difficulty-value-4">5</span></label>
                                <input type="range" class="ai-difficulty-slider" id="ai-difficulty-slider-4" min="1" max="10" step="1" value="5" disabled>
                            </div>
                        </div>
                    </div>
                    <div class="player-input" style="padding-top: 20px;">
                        <label>
                            <input type="checkbox" id="enable-powerups">
                            Enable Powerups
                        </label>
                        <div class="powerup-count">
                            <label for="powerup-count-slider">Powerup Count: <span id="powerup-count">4</span></label>
                            <input type="range" class="powerup-count-slider" id="powerup-count-slider" min="1" max="10" step="1" value="5" disabled>
                        </div>
                    </div>
                    <button id="add-player-button" style="margin-bottom: 20px" class="sign-in-button">Add Player</button>
                    <button id="start-tournament-button" style="margin-bottom: 20px" class="sign-in-button">Start Tournament</button>
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
        this.resetInputs();
    }

    resetInputs() {
        const playerInputs = this.shadowRoot.getElementById('player-inputs');
        while (playerInputs.children.length > 4) {
            playerInputs.removeChild(playerInputs.lastChild);
        }
        for (let i = 2; i <= 4; i++) {
            const playerInput = playerInputs.children[i - 1];
            const input = playerInput.querySelector('input[type="text"]');
            const checkbox = this.shadowRoot.getElementById(`ai-checkbox-${i}`);
            const slider = this.shadowRoot.getElementById(`ai-difficulty-slider-${i}`);
            const difficultyValue = this.shadowRoot.getElementById(`difficulty-value-${i}`);

            input.value = `Player ${i}`;
            checkbox.checked = false;
            slider.value = '5';
            slider.disabled = true;
            if (difficultyValue) {
                difficultyValue.textContent = '5';
            }
        }
    }

    setupEventListeners() {
        const addPlayerButton = this.shadowRoot.getElementById('add-player-button');
        const closeButton = this.shadowRoot.getElementById('close-dialog-button');
        const overlay = this.shadowRoot.getElementById("overlay");
        const startTournamentButton = this.shadowRoot.getElementById('start-tournament-button');
        const playerInputs = this.shadowRoot.getElementById('player-inputs');

        // Setup event listeners for the hardcoded players (Player 2, 3, 4)
        for (let i = 2; i <= 4; i++) {
            const checkbox = this.shadowRoot.getElementById(`ai-checkbox-${i}`);
            const slider = this.shadowRoot.getElementById(`ai-difficulty-slider-${i}`);
            const difficultyValue = this.shadowRoot.getElementById(`difficulty-value-${i}`);

            if (!checkbox || !slider || !difficultyValue) {
                console.warn(`Missing elements for Player ${i}. Skipping setup.`);
                continue;
            }
            checkbox.addEventListener("change", () => {
                slider.disabled = !checkbox.checked;
                if (!checkbox.checked) difficultyValue.textContent = "5";
            });
            slider.addEventListener("input", () => {
                difficultyValue.textContent = slider.value;
            });
        }

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

        // Adding dynamic players
        addPlayerButton.addEventListener("click", () => {
            const playerIndex = playerInputs.children.length + 1; // Get new player index
            const playerDiv = document.createElement("div");
            playerDiv.classList.add("player-input");
            playerDiv.dataset.index = playerIndex;

            // Input for player name
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${playerIndex}`;
            input.value = `Player ${playerIndex}`;

            // AI Checkbox
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("ai-checkbox");
            checkbox.dataset.index = playerIndex;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode("AI"));

            // AI Difficulty controls
            const aiDifficultyDiv = document.createElement("div");
            aiDifficultyDiv.classList.add("ai-difficulty");
            const difficultyLabel = document.createElement("label");
            difficultyLabel.htmlFor = `ai-difficulty-slider-${playerIndex}`;
            difficultyLabel.innerHTML = `Difficulty: <span id="difficulty-value-${playerIndex}">5</span>`;
            const slider = document.createElement("input");
            slider.type = "range";
            slider.classList.add("ai-difficulty-slider");
            slider.id = `ai-difficulty-slider-${playerIndex}`;
            slider.min = "1";
            slider.max = "10";
            slider.step = "1";
            slider.value = "5";
            slider.disabled = true;

            aiDifficultyDiv.appendChild(difficultyLabel);
            aiDifficultyDiv.appendChild(slider);

            // Remove Button
            const removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-player-button");
            removeButton.addEventListener("click", () => {
                playerDiv.remove();
                // Update player placeholders
                const inputFields = playerInputs.querySelectorAll(".player-input input[type='text']");
                inputFields.forEach((input, index) => {
                    input.placeholder = `Player ${index + 1}`;
                });
            });

            // Assemble Player Div
            playerDiv.appendChild(removeButton);
            playerDiv.appendChild(input);
            playerDiv.appendChild(label);
            playerDiv.appendChild(aiDifficultyDiv);
            playerInputs.appendChild(playerDiv);

            // Add event listeners for AI checkbox and slider
            checkbox.addEventListener("change", () => {
                slider.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    const difficultyValue = this.shadowRoot.getElementById(`difficulty-value-${playerIndex}`);
                    if (difficultyValue) {
                        difficultyValue.textContent = "5";
                    }
                }
            });

            slider.addEventListener("input", () => {
                const difficultyValue = this.shadowRoot.getElementById(`difficulty-value-${playerIndex}`);
                if (difficultyValue) {
                    difficultyValue.textContent = slider.value;
                }
            });
        });

        let hasErrors = false;
        let errorMsg = "Error creating tournament. Check player names";
        const powerupCheckbox = this.shadowRoot.getElementById('enable-powerups');
        const powerupSlider = this.shadowRoot.getElementById('powerup-count-slider');
        const powerupCount = this.shadowRoot.getElementById('powerup-count');

        powerupCheckbox.addEventListener("change", () => {
            powerupSlider.disabled = !powerupCheckbox.checked;
            if (!powerupCheckbox.checked) powerupCount.textContent = "5";
        });

        powerupSlider.addEventListener("input", () => {
            powerupCount.textContent = powerupSlider.value;
        });
        startTournamentButton.addEventListener("click", () => {
            const players = Array.from(playerInputs.children).map((playerDiv, index) => {
                const input = playerDiv.querySelector('input[type="text"]');
                const checkbox = playerDiv.querySelector('input[type="checkbox"]');
                const slider = playerDiv.querySelector('input[type="range"]');

                try {
                    if (index === 0) {
                        input.value = this.username;
                    }
                    const username = validateInput(input.value);
                    return {
                        username,
                        isAI: checkbox ? checkbox.checked : false,
                        aiDifficulty: (checkbox && checkbox.checked) ? slider.value : null,
                        id: index,
                    };
                } catch (err) {
                    hasErrors = true;
                    errorMsg = err;
                    console.log(err);
                }
            });

            if (hasErrors) {
                showToast(errorMsg, 'danger');
                return;
            }

            let powerCounts = 0;
            if (powerupCheckbox.checked) {
                powerCounts = powerupSlider.value;
            }

            const validPlayers = players.filter((player) => player.username.trim().length > 0);
            if (validPlayers.length < 4 || validPlayers.length % 2 !== 0) {
                showToast("You need at minimum 4 players and an even number of players.", 'danger');
                return;
            }
            // Credit: https://stackoverflow.com/questions/30924280/what-is-the-best-way-to-determine-if-a-given-number-is-a-power-of-two
            if (Math.log2(validPlayers.length) % 1 !== 0) {
                showToast("Total number of players should be a power of 2", 'danger');
                return;
            }
            const username = validPlayers.map(player => player.username.toLowerCase());
            const uniqueNames = new Set(username);
            if (uniqueNames.size !== username.length) {
                showToast("Cannot have duplicate usernames", 'danger');
                return;
            }
            GlobalEventEmitter.emit(EVENT_TYPES.START_TOURNAMENT, { players: validPlayers, powerCounts });
            this.close();
        });
    }
}

customElements.define("tournament-setup-dialog", TournamentSetupDialog);
