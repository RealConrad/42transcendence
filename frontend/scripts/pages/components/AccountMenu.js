export class AccountMenu extends HTMLElement {
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
            <div>Account or settings?</div>
        `
    }
}

customElements.define('account-menu', AccountMenu);