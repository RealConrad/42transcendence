export class AboutMenu extends HTMLElement {
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
            <div>Yeah, something here later.</div>
        `
    }
}

customElements.define('about-menu', AboutMenu);