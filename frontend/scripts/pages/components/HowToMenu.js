export class HowToMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.preloadedImage = new Image();
        this.preloadedImage.src = "../../../styles/keys.png";
    }
    connectedCallback() {
        this.render();
        this.displayPowerUps();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    html() {
        return `
            <style>
                .how-to-container {
                    display: grid;
                    grid-template-rows: 1fr 2fr 2fr; /* Allocate space: 20% for description, 40% each for powers and controls */
                    grid-template-columns: 1fr; /* One column layout */
                    color: #fff; /* Ensure text is white */
                    grid-row: 1 / -1;
                    grid-column: 1 / -1;
                    height: 100%; /* Ensure it fills the parent container */
                    }

                    .description-container {
                    text-align: center;
                    grid-row: 1; /* Place in the first row */
                    grid-column: 1; /* Only one column to consider */
                    }

                    #power-title {
                    color: #ffffff;
                    font-size: calc(var(--font-size) * 0.8);
                    }

                    #description {
                    color: #ffffff;
                    font-size: calc(var(--font-size) * 0.6);
                    font-family: Inter;
                    }

                    .atk-def-container {
                    font-size: calc(var(--font-size) * 0.8);
                    display: flex;
                    justify-content: center;
                    padding-left: 30%;
                    padding-right: 30%;
                    padding-bottom: 5%;
                    grid-row: 2; /* Place in the second row */
                    grid-column: 1;
                    }


                    .atk-powers, .def-powers {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-grow: 1;
                    justify-content: space-around;
                    }

                    .controls {
                    grid-row: 3; /* Place in the third row */
                    grid-column: 1;
                    display: flex;
                    justify-content: center;
                    }

                    /* power */

                    .power {
                    width: calc(var(--paddle-width) * 3.0);
                    z-index: 10;
                    height: calc(var(--paddle-width) * 3.0);
                    background-color: rgba(255, 255, 255, 0.4);
                    color: black;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    font-size: calc(var(--paddle-width) * 1.4); /* Adjust size as needed for a single character */

                    }

                    .after-image, .after-shake, .after-after-shake {
                    z-index: 5;
                    width: calc(var(--paddle-width) * 3.8);
                    height: calc(var(--paddle-width) * 3.8);
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.2);
                    animation: shake 1.5s infinite;
                    animation-delay: var(--animation-delay-delay);
                    }

                    .after-shake {
                    height: calc(var(--paddle-width) * 4.0);
                    animation-delay: calc(var(--animation-delay-delay) + 0.5s);
                    }

                    .after-after-shake {
                    width: calc(var(--paddle-width) * 4.0);
                    animation-delay: calc(var(--animation-delay-delay) + 1.0s);
                    }

                    .power-text{
                    z-index: 20;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    /* padding-top: 3px; */
                    font-size: calc(var(--paddle-width) * 1.8);
                    font-weight: bold;
                    color: black;
                    }

                    /* Keyframes for shaking effects */
                    @keyframes shake {
                    0%, 100% { transform: translate(-2px, 2px); }
                    10%, 90% { transform: translate(2px, -2px); }
                    20%, 80% { transform: translate(2px, 2px); }
                    30%, 70% { transform: translate(-2px, -2px); }
                    40%, 60% { transform: translate(2px, -2px); }
                    50% { transform: translate(-2px, 2px); }
                    }

                    .power:hover .after-image {
                    background-color: rgba(0, 255, 0, 0.3); /* Change to green on hover */
                    }

                    .power:hover .after-shake {
                    background-color: rgba(255, 0, 0, 0.3); /* Change to orange on hover */
                    }

                    .power:hover .after-after-shake {
                    background-color: rgba(0, 0, 255, 0.3); /* Keep blue on hover */
                }

            </style>
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
                    <img src="${this.preloadedImage.src}" alt="Controls" style="max-height: 100%; max-width: 60%; height: auto; width: auto; pointer-events: none;" />
                </div>
            </div>
        `
    }

    displayPowerUps() {
        const atkPowers = [
            { symbol: "%", title: "The Paddle Games", desc: "Teleport the ball to the other side<br>mirroring its origin position and direction." },
            { symbol: ">", title: "Run Ball, Run!", desc: "Increase the ball speed by x3 until a point gets scored." },
            { symbol: "&", title: "No U!", desc: "Reverses the direction of the ball and<br>increase its speed x2 until a point gets scored." },
            { symbol: "-", title: "Honey, I Shrunk the Paddle", desc: "Halves the size of opponent's paddle until he loses a point." },
            { symbol: "¿", title: "Down is the new Up", desc: "Reverses up and down keys of an opponent until<br>a point is scored or 5 seconds." }
        ];

        const defPowers = [
            { symbol: "|", title: "You Shall Not Pass!", desc: "Your paddle becomes the max size for 2 seconds or<br>until it deflects the ball with 2x speed for remaining time." },
            { symbol: "@", title: "Get Over Here!", desc: "Pull the ball to your paddle, stick it for 1s and<br>shoot straight with 4x speed for 1 second." },
            { symbol: "+", title: "Paddle STRONG!", desc: "Your paddle doubles in size until point scored." },
            { symbol: "*", title: "Slow-Mo", desc: "The ball slows down for 2 seconds or until hits a paddle and<br>increases speed x2 for a duration of slow-mo part." },
            { symbol: "=", title: "For Justice!", desc: "Teleports paddles of both players to a ball position and<br>freezes them in place for 1 second." }
        ];

        const atkContainer = this.shadowRoot.querySelector(".atk-powers");
        atkPowers.forEach(power => this.createPowerElement(power, atkContainer));

        const defContainer = this.shadowRoot.querySelector(".def-powers");
        defPowers.forEach(power => this.createPowerElement(power, defContainer));
    }

    createPowerElement(power, container) {
        let powerDiv = document.createElement('div');
        powerDiv.className = 'power';
        powerDiv.style.setProperty('--animation-delay-delay', `${Math.random() * 0.5}s`);

        let powerText = document.createElement('div');
        powerText.className = 'power-text';
        powerText.textContent = power.symbol;

        let afterImage = document.createElement('div');
        afterImage.className = 'after-image';

        let afterShake = document.createElement('div');
        afterShake.className = 'after-shake';

        let afterAfterShake = document.createElement('div');
        afterAfterShake.className = 'after-after-shake';

        powerDiv.appendChild(powerText);
        powerDiv.appendChild(afterImage);
        powerDiv.appendChild(afterShake);
        powerDiv.appendChild(afterAfterShake);

        powerDiv.addEventListener('mouseover', () => {
            this.shadowRoot.getElementById('power-title').textContent = power.title;
            this.shadowRoot.getElementById('description').innerHTML = power.desc;
        });
        powerDiv.addEventListener('mouseleave', () => {
            this.shadowRoot.getElementById('power-title').textContent = 'HowTo?';
            this.shadowRoot.getElementById('description').innerHTML = 'Collect Powers and use them with ATK and DEF keys!<br>Hover over the powers to see their descriptions.';
        });
        container.appendChild(powerDiv);
    }

}
customElements.define('how-to-menu', HowToMenu);