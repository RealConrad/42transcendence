export class TournamentMenu extends HTMLElement {
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
            <div>Tournament menu!</div>
        `
    }
}

customElements.define('tournament-menu', TournamentMenu);