import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class PlayMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.player1_name = null;
        this.player2_name = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/style.css">
            <div class="menu-option">
                <button style="text-align: right">vs AI</button>
                <span class="button-description">don’t worry, its not chatGPT</span>
            </div>
            <div class="menu-option">
                <button style="text-align: right">local</button>
                <span class="button-description">one keyboard? just dont elbow each other</span>
            </div>
            <div id="input" class="">
                hello    
            </div>
        `
    }

    getPlayerNames() {
        const player1_name = localStorage.getItem("username");

    }

    setupEventListeners() {
        const gameplayOptions = this.shadowRoot.querySelectorAll(".menu-option");
        gameplayOptions.forEach((option) => {
            // Used for cursor hover effects
            option.addEventListener("mouseover", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: option });
            });
            option.addEventListener("mouseout", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: option});
            });

            // local click event
            option.addEventListener('click', (event) => {
                const buttonText = event.target.textContent.trim();
                console.log("buttonText:", buttonText);
                if (buttonText === "vs AI") {
                    this.handleAIMatch();
                } else if (buttonText === "local") {
                    this.handleLocalMatch();
                }
            })
        });
    }

    handleAIMatch() {
        this.player2_name = "AI";
        this.player1_name = localStorage.getItem("username");
        if (!this.player1_name) {
            // display input
        }
    }

    sendStartMatchEvent() {
        GlobalEventEmitter.emit(EVENT_TYPES.START_MATCH, {});
    }

    reset() {
        this.player1_name = null;
        this.player2_name = null;
    }
}

customElements.define('play-menu', PlayMenu);