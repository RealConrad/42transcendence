import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class PlayMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
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
        `
    }

    setupEventListeners() {
        const gameplayOptions = this.shadowRoot.querySelectorAll(".menu-option");
        gameplayOptions.forEach((option) => {
            option.addEventListener("mouseover", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: option });
            });
            option.addEventListener("mouseout", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: option});
            });
        });
    }
}

customElements.define('play-menu', PlayMenu);