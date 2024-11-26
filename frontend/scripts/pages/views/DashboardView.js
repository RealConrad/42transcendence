import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";

export class DashboardView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.isGameRunning = false;
        this.canvas = null;
        this.ctx = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
    }

    connectedCallback() {
        this.loadMenuComponents();
        this.render();
        this.initMenu();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/style.css">
            <header>
                PONG
                <button id="login-button" class="orange-button">
                    LOGIN
                </button>
            </header>
            <main-menu>
                <canvas id="gameCanvas"></canvas>
                <auth-dialog id="auth-dialog"></auth-dialog>
                <left-menu>
                    <div class="menu-option">
                        <button>HowTo</button>
                        <span class="button-description">What is this?</span>
                    </div>
                    <div class="menu-option">
                        <button>Play</button>
                        <span class="button-description">How would you like your PONG today?</span>
                    </div>
                    <div class="menu-option">
                        <button>Tournament</button>
                        <span class="button-description">Will you dare?!</span>
                    </div>
                    <div class="menu-option" style="grid-row-start: 4;">
                        <button>About</button>
                        <span class="button-description">ft_transcendence at 42 Heilbronn</span>
                    </div>
                </left-menu>
                <right-menu>
                    <div id="right-menu-container"></div>
                </right-menu>
            </main-menu>
        `;
    }

    loadMenuComponents() {
        import("../components/auth-dialog.js");
        import("../components/HowToMenu.js");
        import("../components/AboutMenu.js");
        import("../components/PlayMenu.js");
        import("../components/TournamentMenu.js");
    }

    setupEventListeners() {
        const menuOptions = this.shadowRoot.querySelectorAll(".menu-option");
        menuOptions.forEach((option) => {
            option.addEventListener("mouseover", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: option })
            });
            option.addEventListener("mouseout", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: option} )
            });
        });

        // Component based listeners
        const loginButton = this.shadowRoot.getElementById("login-button");
        const authDialogPopup = this.shadowRoot.getElementById("auth-dialog");
        loginButton.addEventListener("click", () => {
            authDialogPopup.open();
        })
        console.log("Login button ", loginButton);
    }

    initMenu() {
        this.canvas = this.shadowRoot.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        const updateCanvasSize = () => {
            this.canvas.width = this.shadowRoot.host.offsetWidth;
            this.canvas.height = this.shadowRoot.host.offsetHeight;
            this.drawMiddleLine();
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        this.leftPaddle = this.createPaddle("left");
        this.rightPaddle = this.createPaddle("right");

        this.initializePaddleMovement();
        this.initializeMenuInteractions();
    }

    drawMiddleLine() {
        const paddleWidth = this.canvas.width / 128;
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = paddleWidth;
        this.ctx.setLineDash([paddleWidth, paddleWidth]);

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();

        this.ctx.setLineDash([]); // Reset line dash
    }

    createPaddle(side) {
        const paddle = document.createElement("div");
        paddle.classList.add("paddle");
        paddle.style.height = `${this.canvas.height * 0.1}px`;
        paddle.style.top = `${(this.canvas.height - paddle.offsetHeight) / 2}px`; // Center vertically
        if (side === "left") {
            this.shadowRoot.querySelector("left-menu").appendChild(paddle);
            paddle.style.left = '0px';

        } else if (side === "right") {
            this.shadowRoot.querySelector("right-menu").appendChild(paddle);
            paddle.style.right = '0px';
        }
        return paddle;
    }

    initializePaddleMovement() {
        document.addEventListener("mousemove", (e) => {
            const canvasRect = this.canvas.getBoundingClientRect();
            const paddleHeight = this.leftPaddle.offsetHeight;
            const mouseY = e.clientY - canvasRect.top;

            // move paddle if cursor on left menu side
            if (e.clientX <= canvasRect.left + canvasRect.width / 2) {
                this.leftPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, this.canvas.height - paddleHeight)
                )}px`;
            }

            // move paddle if cursor on right menu side
            if (e.clientX >= canvasRect.left + canvasRect.width / 2) {
                this.rightPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, this.canvas.height - paddleHeight)
                )}px`;
            }
        });
    }

    initializeMenuInteractions() {
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

    startGame() {
        this.isGameRunning = true;

        this.leftPaddle.style.display = "none";
        this.rightPaddle.style.display = "none";

    }
}

customElements.define("dashboard-view", DashboardView);
