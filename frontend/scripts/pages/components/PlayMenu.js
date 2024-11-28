import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class PlayMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
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
            <link rel="stylesheet" href="../../../styles/dialog.css">
            <div class="menu-option">
                <button style="text-align: right">vs AI</button>
                <span class="button-description">don’t worry, its not chatGPT</span>
            </div>
            <div class="menu-option">
                <button style="text-align: right">local</button>
                <span class="button-description">one keyboard? just dont elbow each other</span>
            </div>
        `
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
                if (buttonText === "vs AI") {
                    GlobalEventEmitter.emit(EVENT_TYPES.MATCH_VS_AI);
                } else if (buttonText === "local") {
                    GlobalEventEmitter.emit(EVENT_TYPES.MATCH_LOCAL);
                }
            });
        });
    }
}

customElements.define('play-menu', PlayMenu);