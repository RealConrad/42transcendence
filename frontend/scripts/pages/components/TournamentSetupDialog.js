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
                            <label>
                                <input type="checkbox" disabled>
                                AI
                            </label>
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 2">
                            <label>
                                <input type="checkbox">
                                AI
                            </label>
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 3">
                            <label>
                                <input type="checkbox">
                                AI
                            </label>
                        </div>
                        <div class="player-input">
                            <input type="text" placeholder="Player 4">
                            <label>
                                <input type="checkbox">
                                AI
                            </label>
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

        addPlayerButton.addEventListener("click", () => {
            const playerDiv = document.createElement("div");
            playerDiv.classList.add("player-input");

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${playerInputs.children.length + 1}`;

            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode("AI"));

            const removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-player-button");
            removeButton.addEventListener("click", () => {
                playerDiv.remove();
                const inputFields = playerInputs.querySelectorAll(".player-input input[type='text']");
                inputFields.forEach((input, index) => {
                    input.placeholder = `Player ${index + 1}`;
                });
            });

            playerDiv.style.position = "relative";
            playerDiv.appendChild(removeButton);
            playerDiv.appendChild(input);
            playerDiv.appendChild(label);
            playerInputs.appendChild(playerDiv);
        });

        let hasErrors = false;
        let errorMsg = "Error creating tournament. Check player names";
        startTournamentButton.addEventListener('click', () => {
            const players = Array.from(playerInputs.children).map((playerDiv, index) => {
                const input = playerDiv.querySelector('input[type="text"]');
                const checkbox = playerDiv.querySelector('input[type="checkbox"]');
                try {
                    if (index === 0) {
                        input.value = this.username;
                    }
                   const name = validateInput(input.value);
                   return {
                       name,
                       isAI: checkbox.checked,
                   }
                } catch(err) {
                    hasErrors = true;
                    errorMsg = err;
                    console.log(err);
                }
            });
            if (hasErrors) {
                alert(errorMsg);
                return;
            }

            console.log(players);
            const validPlayers = players.filter(player => player.name.length > 0);
            if (validPlayers.length < 4 || validPlayers % 2 !== 0) {
                alert("You at minimum 4 players and even number of players.");
                return;
            }
            console.log("Starting tournament with players:", validPlayers);
            GlobalEventEmitter.emit(EVENT_TYPES.START_TOURNAMENT, {players: validPlayers});
            this.close();
        });
    }
}

customElements.define("tournament-setup-dialog", TournamentSetupDialog);
