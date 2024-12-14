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
            <style>
                    p {
                        margin-left: 40px;
                    }

                    a {
                        all: unset
                    }

                    .container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        width: 100%;
                        text-align: center;
                        position: relative;
                    }


                    .heading {
                        font-size: 2rem;
                        margin: 10px;
                        color: white;
                    }

                    .subheading {
                        font-size: 1.2rem;
                        padding-top: 25px;
                        font-family: Inter;
                        color: #C7C4BF;
                    }

                    .description {
                        color: darkgray;
                        font-family: Inter;
                    }

                    @keyframes spin-clockwise {
                    to {
                        transform: rotate(360deg);
                    }
                    }

                    @keyframes spin-anti-clockwise {
                    to {
                        transform: rotate(-360deg);
                    }
                    }

                    .circle-container {
                        color: white;
                        width: 500px;
                        height: 500px;
                        display: grid;
                        place-items: center;
                        position: relative; /* Required for absolute children */
                    }

                    .name-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        text-align: center;
                    }

                    .highlight {
                        color: #FFCB13;
                    }

                    .user {
                        transition: transform 0.3s ease, color 0.3s ease;
                    }

                    .user:hover {
                        transform: scale(1.2);
                    }

                    .text-ring {
                        color: lightgray;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        display: grid;
                        place-items: center;
                        font-weight: bold;
                        font-family: monospace;
                        text-transform: uppercase;
                        animation: spin-clockwise 30s linear infinite;
                        transform-origin: center;
                    }

                    .inner-ring {
                        animation: spin-anti-clockwise 40s linear infinite;
                    }

                    .text-ring [style*=--index] {
                        --inner-angle: calc((360 / var(--total)) * 1deg);
                        --radius: calc((var(--character-width, 1) / sin(var(--inner-angle))) * -1ch);
                        font-size: calc(var(--font-size, 2) * 1rem);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform-origin: 50% 50%;
                        transform:
                        translate(-50%, -50%)
                        rotate(calc(var(--inner-angle) * var(--index)))
                        translateY(var(--radius));
                    }
                </style>
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