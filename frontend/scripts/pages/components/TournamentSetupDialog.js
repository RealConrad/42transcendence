import {validateInput} from "../../api/api.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class TournamentSetupDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        // TODO: Get from localstorage
        this.username = "Conrad";
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
           <link rel="stylesheet" href="../../../styles/dialog.css">
           <div id="overlay" class="overlay">
                <div class="dialog">
                    <div class="heading">Tournament Setup</div>
                    <div id="player-inputs" class="player-inputs">
                        <div class="player-input">
                            <input type="text" placeholder="Player 1 (You)" disabled value="${this.username} (You)">
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 2">
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
                            <input type="text" placeholder="Player 3">
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
                            <input type="text" placeholder="Player 4">
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
                    };
                } catch (err) {
                    hasErrors = true;
                    errorMsg = err;
                    console.log(err);
                }
            });

            if (hasErrors) {
                alert(errorMsg);
                return;
            }

            const validPlayers = players.filter((player) => player.username.trim().length > 0);
            if (validPlayers.length < 4 || validPlayers.length % 2 !== 0) {
                alert("You need at minimum 4 players and an even number of players.");
                return;
            }
            const username = validPlayers.map(player => player.username.toLowerCase());
            const uniqueNames = new Set(username);
            if (uniqueNames.size !== username.length) {
                alert("Cannot have duplicate usernames");
                return;
            }
            console.log("Starting tournament with players:", validPlayers);
            GlobalEventEmitter.emit(EVENT_TYPES.START_TOURNAMENT, { players: validPlayers });
            this.close();
        });
    }
}

customElements.define("tournament-setup-dialog", TournamentSetupDialog);
