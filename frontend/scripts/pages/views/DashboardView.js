import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";
import Game from "../../game/Game.js";
import {apiCall, getAccessToken, getUserName} from "../../api/api.js";
import { USER } from "../../utils/constants.js";

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
        this.showAllDashboardUI();
        this.displayUser();
    }
    
    render() {
        console.log("rendering again");
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    async displayUser(){
        let data = await this.getUserData();
        console.log('this is api data: ');
        console.log(data);
        USER.loggedIn = data.logged_in;
        USER.username = data.username;
        USER.profilePicture = data.profile_picture;
        console.log('user logged in: ', USER.loggedIn);
        console.log(USER.profilePicture);

        //render again
        this.loadMenuComponents();
        this.render();
        this.initMenu();
        this.showAllDashboardUI();    }
    
    async getUserData() {
        try {
            const response = await apiCall('http://127.0.0.1:8000/api/auth/get_user_data/');
            if (response.ok) {
                const data = await response.json();
                return data; // Return the fetched data
            } else {
                const errorData = await response.json();
                console.error("Response not 200");
                throw new Error(JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("An error occurred:", error);
            throw error; // Re-throw the error for the caller to handle
        }
    }
    
    //as long as no username available display login
    //if accesstoken available -> get username and change button style
    //if logout: display login

    html() {
        return `
            <link rel="stylesheet" href="../../../styles/style.css">
            <header>
                <div class="header-top">
                    <span id="player1-display" class="player1_score">Player 1 - 0</span>
                    <div class="title">PONG</div>
                    <span id="player2-display" class="player2_score">Player 2 - 0</span>
                </div>

            ${!USER.loggedIn ?
                `
                    <button id="login-button" class="orange-button">
                        LOGIN
                    </button>
                `  
                :
                `
                    <button id="login-button" class="orange-button">
                        ${USER.profilePicture ?
                        `<img src=${USER.profilePicture} id="login-profile-pic">`
                        :``}
                        ${USER.username}
                    </button>
                `
            }
            </header>
            <main-menu>
                <canvas id="gameCanvas"></canvas>
                <auth-dialog id="auth-dialog"></auth-dialog>
                <game-setup-dialog id="game-setup-dialog"></game-setup-dialog>
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
                        <button>Account</button>
                        <span class="button-description">Who are you anyway?</span>
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
            <footer>
                <div class="footer-container">
                    <div class="footer-label">Created By</div>
                    <div class="team">
                        <a href="https://github.com/RealConrad/" target="_blank" class="teammate teammate1">cwenz</a>
                        <a href="https://www.github.com/kglebows/" target="_blank" class="teammate teammate2">kglebows</a>
                        <a href="https://www.github.com/harshkumbhani/" target="_blank" class="teammate teammate3">hkumbhan</a>
                        <a href="https://github.com/vivilenard/" target="_blank" class="teammate teammate4">vivi</a>
                        <a href="https://github.com/PetruCazac/" target="_blank" class="teammate teammate5">pcazac</a>
                    </div>
                </div>
            </footer>
        `;
    }

    loadMenuComponents() {
        import ("../components/GameSetupDialog.js");
        import("../components/AuthDialog.js");
        import("../components/HowToMenu.js");
        import("../components/PlayMenu.js");
        import("../components/AccountMenu.js");
        import("../components/AboutMenu.js");
    }

    setupEventListeners() {
        const loginButton = this.shadowRoot.getElementById("login-button");
        const authDialogPopup = this.shadowRoot.getElementById("auth-dialog");
        const contributor = this.shadowRoot.querySelector(".team");
        loginButton.addEventListener("click", () => {
            authDialogPopup.open();
        });
        loginButton.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: loginButton});
        });
        loginButton.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: loginButton});
        });

        contributor.addEventListener("mouseover", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: contributor});
        });
        contributor.addEventListener("mouseout", () => {
            GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: contributor});
        });

        GlobalEventEmitter.on(EVENT_TYPES.MATCH_VS_AI, () => {
            console.log("VS AI");
            this.openGameSetupDialog("vs AI");
        });
        GlobalEventEmitter.on(EVENT_TYPES.MATCH_LOCAL, () => {
            console.log("LOCAL");
            this.openGameSetupDialog("local");
        });
        GlobalEventEmitter.on(EVENT_TYPES.START_MATCH, ({ player1Name, player2Name, matchType}) => {
            this.startGame(player1Name, player2Name, matchType !== "local");
        });
        GlobalEventEmitter.on(EVENT_TYPES.QUIT_MATCH, () => {
            this.endGame();
        });
        GlobalEventEmitter.on(EVENT_TYPES.UPDATE_SCORE, ({ player1Name, player2Name, player1Score, player2Score }) => {
            this.updateScores(player1Name, player2Name, player1Score, player2Score);
        })
    }

    openGameSetupDialog(matchType) {
        const gameSetupDialog = this.shadowRoot.getElementById("game-setup-dialog");
        gameSetupDialog.setMatchType(matchType);
        gameSetupDialog.open();
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
            const footerHeight = this.shadowRoot.querySelector("footer").offsetHeight;
            const paddleHeight = this.leftPaddle.offsetHeight;
            const mouseY = e.clientY - canvasRect.top;

            // Calculate the max Y position to prevent paddle from overlapping the footer
            const maxY = this.canvas.height - paddleHeight - footerHeight - 80;

            // Move the left paddle if the cursor is on the left menu side
            if (e.clientX <= canvasRect.left + canvasRect.width / 2) {
                this.leftPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, maxY)
                )}px`;
            }

            // Move the right paddle if the cursor is on the right menu side
            if (e.clientX >= canvasRect.left + canvasRect.width / 2) {
                this.rightPaddle.style.top = `${Math.max(
                    0,
                    Math.min(mouseY - paddleHeight / 2, maxY)
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
            "Account": "account-menu",
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

    startGame(player1Name, player2Name, vsAI) {
        this.hideAllDashboardUI();
        this.isGameRunning = true;
        console.log(`STARTING MATCH: ${player1Name} vs ${player2Name}`);
        // update initial scores
        this.updateScores(player1Name, player2Name, 0, 0);
        const game = new Game(this.canvas, vsAI, player1Name, player2Name);
        game.start();
    }

    updateScores(player1Name, player2Name, player1Score, player2Score) {
        const player1Display = this.shadowRoot.getElementById("player1-display");
        const player2Display = this.shadowRoot.getElementById("player2-display");

        player1Display.textContent = `${player1Name} - ${player1Score}`;
        player2Display.textContent = `${player2Name} - ${player2Score}`;
    }

    endGame() {
        this.isGameRunning = false;
        this.showAllDashboardUI();
        console.log("Match ended, dashboard UI Restored");
    }

    hideAllDashboardUI() {
        this.leftPaddle.style.display = "none";
        this.rightPaddle.style.display = "none";
        this.shadowRoot.querySelector("left-menu").style.display = "none";
        this.shadowRoot.querySelector("right-menu").style.display = "none";
        this.ctx.setLineDash([]);
        this.shadowRoot.querySelector(".player1_score").style.display = "block";
        this.shadowRoot.querySelector(".player2_score").style.display = "block";
    }

    showAllDashboardUI() {
        this.leftPaddle.style.display = "block";
        this.rightPaddle.style.display = "block";
        this.shadowRoot.querySelector("left-menu").style.display = "grid";
        this.shadowRoot.querySelector("right-menu").style.display = "block";
        this.shadowRoot.querySelector(".player1_score").style.display = "none";
        this.shadowRoot.querySelector(".player2_score").style.display = "none";
    }
}

customElements.define("dashboard-view", DashboardView);
