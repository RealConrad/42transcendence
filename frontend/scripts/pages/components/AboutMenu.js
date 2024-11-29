import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class AboutMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
    }
    connectedCallback() {
        this.render();
        this.setupContributionCircle();
        this.attachListners();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/about.css">
            <div class="container">
                <div class="heading">ft_transcendence</div>
                <div class="subheading">Final Project at 42 Heilbronn</div>
                <div class="description">
                    <p>
                        During our Transcendence project, we dived into building a full-stack web application
                        using microservices. We tackled both backend and frontend, using Python (Django) for the backend
                        and JavaScript for the frontend.
                    </p>
                    <p>
                        Along the way, we implemented REST APIs, JWT authentication, 2FA security, and set up NGINX 
                        for serving the frontend. 
                    </p>
                    <p>
                        It was a hands-on journey that taught us how to connect the dots 
                        between technologies, from designing secure systems to creating user-friendly UI/UX.
                    </p>
                </div>
                <div class="circle-container">
                    <span class="text-ring outer-ring"></span>
                    <span class="text-ring inner-ring"></span>
                    <div class="name-container">
                        <a href="https://www.github.com/RealConrad/" target="_blank" class="user" data-contributions="Backend,Authentication,Frontend,Game,API,AI">cwenz</a>
                        <a href="https://www.github.com/kglebows/" target="_blank"  class="user" data-contributions="Frontend,Game,AI,UI/UX">kglebows</a>
                        <a href="https://www.github.com/harshkumbhani/" target="_blank" class="user" data-contributions="Backend,Authentication,2FA,API">hkumbhan</a>
                        <a href="https://github.com/vivilenard/" target="_blank" class="user" data-contributions="Frontend,">vivi</a>
                        <a href="https://github.com/PetruCazac/" target="_blank" class="user" data-contributions="NGINX,">petru</a>
                    </div>
                </div>
            </div>
        `
    }

    setupContributionCircle() {
        const outerRing = this.shadowRoot.querySelector('.outer-ring');
        const innerRing = this.shadowRoot.querySelector('.inner-ring');

        const outerRingOptions = {
            text: ' Backend • Authentication • Frontend • Game •',
            size: 2,
            spacing: 1.5,
        };

        const innerRingOptions = {
            text: ' UI/UX        NGINX         2FA         AI         API        ',
            size: 1.4,
            spacing: 1,
        };

        this.createTextRings(outerRing, outerRingOptions);
        this.createTextRings(innerRing, innerRingOptions);
    }

    /**
     * NOTE: This is a messy function, but I don't have time to think of a cleaner solution :(
     */
    createTextRings(htmlElement, options) {
        htmlElement.innerHTML = '';
        const chars = options.text.split(''); // Split text into characters
        htmlElement.style.setProperty('--total', chars.length);
        htmlElement.style.setProperty('--character-width', options.spacing);
        htmlElement.style.setProperty('--font-size', options.size);

        const hiddenChars = document.createElement('span');
        hiddenChars.setAttribute('aria-hidden', 'true');

        let word = ''; // capture chars for the current word
        let currentSpans = []; // to store all the spans for the current word

        chars.forEach((char, index) => {
            if (char === ' ' || char === '•') {
                // since we have a full word --> assign it to all previous spans
                currentSpans.forEach(span => {
                    span.dataset.contributions = word.trim().toLowerCase();
                });
                // reset it for the next word
                word = '';
                currentSpans = [];
            }

            if (char !== ' ' && char !== '•') {
                word += char;
            }
            const span = document.createElement('span');
            span.style.setProperty('--index', index);
            span.textContent = char;
            hiddenChars.appendChild(span);

            // Track spans for the current word
            if (char !== ' ' && char !== '•') {
                currentSpans.push(span);
            }
        });

        // assign `data-word` to the last word (if any)
        currentSpans.forEach(span => {
            span.dataset.contributions = word.trim().toLowerCase();
        });
        htmlElement.appendChild(hiddenChars);
    };

    attachListners() {
        const names = this.shadowRoot.querySelector(".name-container");
        names.addEventListener('mouseover', (e) => {
            if (e.target !== names) {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, () => {
                    GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: e.target});
                });
                e.target.classList.add("highlight");
            }
            const userContributions = e.target.dataset.contributions?.split(",") || [];
            const spans = this.shadowRoot.querySelectorAll(".text-ring span");

            userContributions.forEach((contribution) => {
                spans.forEach((span) => {
                    if (span.dataset.contributions === contribution.toLowerCase()) {
                       span.classList.add("highlight");
                    }
                });
            });
        });
        names.addEventListener('mouseout', (e) => {
            const spans = this.shadowRoot.querySelectorAll(".text-ring span");
            e.target.classList.remove("highlight");
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, () => {
               GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: e.target});
            });
            spans.forEach((span) => span.classList.remove("highlight"));
        });
    }
}

customElements.define('about-menu', AboutMenu);