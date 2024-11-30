export class GameMenuDialog extends  HTMLElement {
    constructor() {
        super();
        this.matchType = "tournament";
        this.attachShadow({mode: 'open'});
    }
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // this.close();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/dialog.css">
            <div id="overlay" class="overlay">
                <div class="dialog">
                    <div class="heading">Game Menu</div>
                    ${this.matchType === "tournament"
                        ? `
                            <div>Tournament Standings</div>
                        `
                        : ``
                    }
                    <button id="quit-match" style="margin-bottom: 20px" class="sign-in-button">Quit</button>
                    <button id="close-dialog-button" class="sign-in-button">Rematch</button>

                </div>
            </div>
        `
    }

    open() {
        this.style.display = "block";
    }

    close() {
        this.style.display = "none";
    }

    setupEventListeners() {
        const overlay = this.shadowRoot.getElementById("overlay");
        const closeButton = this.shadowRoot.getElementById("close-dialog-button");
        const quitButton = this.shadowRoot.getElementById("quit-match");

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
    }

    setMatchType(type) {
        this.matchType = type;
        this.render();
    }

    displayTournamentMatches(matches) {
        console.log("MATCHES oN DIALOG:", matches);
    }
}

customElements.define("game-menu-dialog", GameMenuDialog);