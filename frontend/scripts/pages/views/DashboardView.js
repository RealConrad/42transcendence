export class DashboardView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.loadMenuComponents();
        this.render();
        this.initializeGame();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/style.css">
            <header>PONG</header>
            <main-menu>
                <canvas id="gameCanvas"></canvas>
                <left-menu>
                    <div class="menu-option"><button>HowTo</button><span class="button-description">What is this?</span></div>
                    <div class="menu-option"><button>Play</button><span class="button-description">How would you like your PONG today?</span></div>
                    <div class="menu-option"><button>Tournament</button><span class="button-description">Will you dare?!</span></div>
                    <div class="menu-option" style="grid-row-start: 4;"><button>About</button><span class="button-description">ft_transcendence at 42 Heilbronn</span></div>
                </left-menu>
                <right-menu>
                    <div id="right-menu-container"></div>
                </right-menu>
            </main-menu>
        `;
    }

    loadMenuComponents() {
        import("../components/HowToMenu.js");
        import("../components/AboutMenu.js");
        import("../components/PlayMenu.js");
        import("../components/TournamentMenu.js");
    }

    initializeGame() {
        const canvas = this.shadowRoot.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        const updateCanvasSize = () => {
            canvas.width = this.shadowRoot.host.offsetWidth;
            canvas.height = this.shadowRoot.host.offsetHeight;
            this.drawMiddleLine(ctx, canvas);
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        const leftPaddle = this.createPaddle();
        const rightPaddle = this.createPaddle();

        this.initializeMenuInteractions(leftPaddle, rightPaddle, canvas);
    }

    drawMiddleLine(ctx, canvas) {
        const paddleWidth = canvas.width / 128;
        ctx.strokeStyle = "white";
        ctx.lineWidth = paddleWidth;
        ctx.setLineDash([paddleWidth, paddleWidth]);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        ctx.setLineDash([]); // Reset line dash
    }

    createPaddle() {
        const paddle = document.createElement("div");
        paddle.classList.add("paddle");
        this.shadowRoot.appendChild(paddle);
        return paddle;
    }

    initializeMenuInteractions(leftPaddle, rightPaddle, canvas) {
        const leftMenu = this.shadowRoot.querySelector("left-menu");
        const rightMenuContainer = this.shadowRoot.getElementById("right-menu-container");

        // Map button text to custom elements
        const contentMapping = {
            "HowTo": "how-to-menu",
            "Play": "play-menu",
            "Tournament": "tournament-menu",
            "About": "about-menu",
        };

        leftMenu.addEventListener("mouseover", (event) => {
            const option = event.target.closest(".menu-option");
            if (option) {
                const buttonText = option.querySelector("button").textContent.trim();
                this.updateRightMenuContent(rightMenuContainer, contentMapping[buttonText]);
                this.stickPaddleToMenuOption(leftPaddle, option);
            }
        });

        document.addEventListener("mousemove", (e) => {
            const canvasRect = canvas.getBoundingClientRect();
            const paddleHeight = canvasRect.height * 0.1;

            const mouseY = e.clientY - canvasRect.top - paddleHeight / 2;
            if (mouseY >= 0 && mouseY + paddleHeight <= canvasRect.height) {
                if (e.clientX < window.innerWidth / 2) {
                    leftPaddle.style.top = `${mouseY}px`;
                } else {
                    rightPaddle.style.top = `${mouseY}px`;
                }
            }
        });
    }

    updateRightMenuContent(container, menuTag) {
        if (menuTag) {
            container.innerHTML = "";
            const menuComponent = document.createElement(menuTag);
            container.appendChild(menuComponent);
        }
    }

    stickPaddleToMenuOption(paddle, option) {
        const optionRect = option.getBoundingClientRect();
        paddle.style.top = `${optionRect.top + optionRect.height / 2 - paddle.offsetHeight / 2}px`;
    }
}

customElements.define("dashboard-view", DashboardView);
