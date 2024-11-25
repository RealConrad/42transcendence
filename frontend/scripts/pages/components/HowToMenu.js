export class HowToMenu extends HTMLElement {
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
            <div class="how-to-container">
                <div class="description-container">
                    <h1 id="power-title">HowTo?</h1>
                    <p id="description">Collect Powers and use them with ATK and DEF keys!<br> Hover over the powers to see their descriptions.</p>
                </div>
                <div class="atk-def-container">
                    <div class="atk-powers">
                        ATK
                    </div>
                    <div class="def-powers">
                        DEF
                    </div>
                </div>
                <div class="controls">
                    <img src="../../../styles/keys.png" alt="Controls" style="max-height: 100%; max-width: 60%; height: auto; width: auto; pointer-events: none;" />
                </div>
            </div>
        `
    }
}
customElements.define('how-to-menu', HowToMenu);