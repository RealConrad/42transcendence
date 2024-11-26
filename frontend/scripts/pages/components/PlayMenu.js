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
}

customElements.define('play-menu', PlayMenu);