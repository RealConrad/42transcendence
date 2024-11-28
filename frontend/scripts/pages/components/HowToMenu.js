export class HowToMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
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
            <link rel="stylesheet" href="../../../styles/howto.css">
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