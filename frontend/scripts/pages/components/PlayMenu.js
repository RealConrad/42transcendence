import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {EVENT_TYPES} from "../../utils/constants.js";
import {getAccessToken} from "../../api/api.js";

export class PlayMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
        this.setupEventListeners();
    }

    html() {
        return `
            <style>
                /* Main CSS configurations */
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                @keyframes shake {
                0%, 100% { transform: translate(calc(var(--paddle-width) * -0.4), calc(var(--paddle-width) * -0.4)); }
                10%, 50%, 90% { transform: translate(calc(var(--paddle-width) * -0.8), calc(var(--paddle-width) * -0.4)); }
                20%, 60% { transform: translate(0px, calc(var(--paddle-width) * -0.4)); }
                30%, 70%, 90% { transform: translate(calc(var(--paddle-width) * -0.4), calc(var(--paddle-width) * -0.8)); }
                20%, 40%, 80% { transform: translate(calc(var(--paddle-width) * -0.4), 0px); }
                }

                @keyframes after-shake {
                90%, 10% { transform: translate(calc(var(--paddle-width) * -0.4), calc(var(--paddle-width) * -0.4)); }
                0%, 40%, 100% { transform: translate(calc(var(--paddle-width) * -0.8), calc(var(--paddle-width) * -0.4)); }
                10%, 50% { transform: translate(0px, calc(var(--paddle-width) * -0.4)); }
                20%, 60%, 80% { transform: translate(calc(var(--paddle-width) * -0.4), calc(var(--paddle-width) * -0.8)); }
                10%, 30%, 70% { transform: translate(calc(var(--paddle-width) * -0.4), 0px); }
                }

                .after-image-shake {
                animation: shake 0.6s infinite;
                z-index: 1000;
                }
                .after-image-after-shake {
                animation: after-shake 0.4s infinite;
                z-index: 1000;
                }

                .cursor-after-image {
                position: absolute;
                width: calc(var(--paddle-width) * 1.2);
                height: calc(var(--paddle-width) * 1.2);
                background-color: rgba(255, 255, 255, 0.2);
                pointer-events: none;
                z-index: 1000;
                }

                .cursor-after-image.enlarged {
                width: calc(var(--paddle-width) * 1.8);
                height: calc(var(--paddle-width) * 1.8);
                z-index: 1000;
                }

                .cursor-after-image.yellow {
                background-color: rgba(255, 230, 0, 0.445);
                }

                .cursor-after-image.red {
                background-color: rgba(255, 38, 0, 0.404);
                }

                .cursor-after-image.blue {
                background-color: rgba(0, 81, 255, 0.445);
                }

                .cursor-after-image.green {
                background-color: rgba(30, 255, 0, 0.274);
                }

                .cursor-after-image.purple {
                background-color: rgba(99, 1, 112, 0.277);
                }

                .cursor-after-image.pink {
                background-color: rgba(255, 0, 221, 0.277);
                }

                :root {
                --top-bottom-height: 10vh;
                --game-height: calc(100vh - var(--top-bottom-height)*2);
                --game-width: calc(var(--game-height) * 16 / 9);
                --paddle-width: calc(var(--game-width) / 128);
                --paddle-height: calc(var(--game-height) / 10);
                --background-yellow: #FFCB13;
                --text-color: #333333;
                --text-light: #ffffff;
                --font-size: 3vh; 
                --background-color: black;
                --highlight-color: rgb(255, 255, 255);
                --color: rgb(172, 172, 172);
                --lowlight-color: rgb(100, 100, 100, 0.7);
                --animation-delay-delay: 0.5;
                }

                html, body {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="%23ffffff"><rect width="15" height="15" /></svg>'), auto;
                height: 100%;
                margin: 0;
                padding: 0;
                background-color: var(--background-color);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                font-family: 'Press Start 2P', 'sans-serif';
                }

                button {
                border: none;
                all: unset;
                }

                button:focus {
                outline: none;
                }

                a {
                all: unset;
                }

                header {
                font-size: calc(5vh);
                color: var(--highlight-color);
                display: flex;
                flex-direction: column; /* Allows vertical stacking of elements */
                align-items: center;
                justify-content: center;
                text-align: center;
                width: 100%;
                }

                .header-top {
                display: flex;
                justify-content: space-between; /* Positions scores on the edges */
                align-items: center;
                width: 100%; /* Ensures it spans the entire width */
                padding: 0 1rem; /* Adds spacing on left and right */
                position: relative; /* To ensure alignment within header */
                }

                .title {
                text-align: center;
                flex: 2; /* Ensures it has more space */
                }

                .scores {
                display: flex;
                justify-content: space-between;
                width: 100%;
                font-size: 1.2rem;
                }

                .player1_score {
                font-size: 1.5rem;
                flex: 1;
                text-align: left;
                }

                .player2_score {
                font-size: 1.5rem;
                flex: 1;
                text-align: right;
                }

                footer {
                height: var(--top-bottom-height); /* Fixed height */
                width: 100%; /* Full width */
                display: flex;
                justify-content: end; /* Separate label and team */
                align-items: center; /* Vertically center content */
                color: var(--color, #ffffff);
                font-size: 2rem; /* Adjust font size for better visibility */
                background-color: var(--background-color); /* Match page background */
                padding: 0 20px; /* Add horizontal padding */
                box-sizing: border-box; /* Include padding in width calculation */
                position: relative;
                overflow: hidden;
                }

                .footer-container {
                display: flex;
                justify-content: end;
                align-items: center;
                margin-right: 300px;
                width: 100%;
                }

                .footer-label {
                font-size: 1.5rem; /* Larger font size for "Created by" */
                font-weight: bold;
                color: white;
                margin-right: 50px;
                }

                .team {
                position: relative;
                display: flex;
                justify-content: flex-end;
                align-items: flex-start;
                font-size: 0.9rem;
                color: gray;
                }

                .teammate {
                position: absolute;
                color: gray;
                opacity: 0.8;
                white-space: nowrap; /* Prevent text wrapping */
                transition: transform 0.3s ease, color 0.3s ease;
                }

                .teammate:hover {
                color: var(--background-yellow);
                transform: scale(1.2);
                }

                .teammate1 {
                top: -30px;
                right: -60px;
                }

                .teammate2 {
                top: -10px;
                right: -120px;
                }

                .teammate3 {
                top: 10px;
                right: -100px;
                }

                .teammate4 {
                top: -20px;
                right: -200px;
                }

                .teammate5 {
                top: 5px;
                right: -210px;
                }


                main-menu {
                width: var(--game-width);
                height: var(--game-height);
                position: relative;
                display: flex;
                justify-content: space-between;
                background-color: #fff;
                }

                #gameCanvas {
                width: 100%;
                height: 100%;
                background-color: #000;
                }

                left-menu, right-menu {
                height: var(--game-height);
                position: absolute;
                top: 0;
                }

                left-menu {
                display: grid;
                width: 50%;
                grid-template-rows: repeat(9, 1fr);
                padding-left: 1rem;
                }

                right-menu {
                width: 50%;
                right: 0;
                text-align: right;
                padding-right: 1rem;
                }

                .menu-option button {
                all: unset;
                display: block;
                width: 100%;
                font-size: var(--font-size);
                text-align: left;
                background-color: transparent;
                }

                .menu-option .button-description {
                display: block;
                font-size: calc(var(--font-size) * 0.4);
                color: var(--lowlight-color);
                font-family: Inter;
                }

                .menu-option {
                display: block;
                text-decoration: none;
                font-size: var(--font-size);
                color: var(--color);
                margin: 0.5rem 0;
                }

                #right-menu-container {
                width: 100%;
                height: 100%;
                overflow: hidden; 
                text-align: right;
                display: grid;
                grid-template-rows: repeat(9, 1fr);
                }

                right-menu .menu-option button {
                text-align: right;
                }

                @keyframes flickerGlow {
                0%, 100% {
                    text-shadow: 0 0 calc(var(--paddle-width) * 0.8) rgba(255, 255, 255, 0.5);
                }
                50% {
                    text-shadow: 0 0 calc(var(--paddle-width) * 1.0) rgba(255, 255, 255, 0.7);
                }
                }

                .menu-option:hover button {
                color: #fff; /* Sets text color to white on hover */
                animation: flickerGlow 1s infinite;
                }

                .menu-option button.glowing-effect {
                color: #fff; /* Sets text color to white */
                text-shadow: 0 0 calc(var(--paddle-width) * 0.8) rgba(255, 255, 255, 0.5); /* Initial state of glow */
                animation: flickerGlow 1s infinite; /* Apply the flicker animation */
                }

                .paddle {
                position: absolute;
                width: var(--paddle-width);
                background-color: white;
                }

                .play-button {
                text-align: right;
                }

                auth-dialog {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 100;
                }

                .orange-button {
                position: absolute;
                right: 50px;
                top: 30px;
                background: var(--background-yellow);
                color: black;
                padding: 10px;
                border-radius: 8px;
                font-size: 20px;
                }

                .user-display{
                position: absolute;
                display: flex;
                align-items: center;
                gap: 15px;
                right: 50px;
                top: 30px;
                background: var(--background-yellow);
                color: black;
                padding: 10px 10px;
                border-radius: 8px;
                font-size: 20px;
                }

                .user-display img{
                height: 50px;
                width: 50px;
                border-radius: 50%; /* This makes the image a circle */
                object-fit: cover; /* Ensures the image covers the area without distortion */
                display: block; /* Optional: Removes inline-block spacing */
                }

                /* Media queries */

                @media (max-height: 720px) {
                :root {
                    --top-bottom-height: 0vh;
                    --game-height: 720px;
                    --game-width: 1280px;
                    --font-size: 32px;
                }

                header, footer {
                    display: none; /* Hide header and footer */
                }
                }


                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .dialog {
                    padding: 20px;
                    border-radius: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 50%;
                    max-width: 600px;
                    height: 100%;
                    max-height: 560px;
                    min-width: 300px;
                    min-height: 500px;
                    background: var(--background-yellow);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    font-size: 1rem;
                    color: #333;
                    box-sizing: border-box;
                }

                /*SUPER MESSY I KNOW - ONLY DIFFERENCE IS BIGGER DIMENSIONS -- DONT HAVE TIME TO IMPLEMENT BETTER SOLUTION
                THIS IS USED ON GAME MENU DIALOG
                */
                .overlay2 {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .dialog2 {
                    padding: 20px;
                    border-radius: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 50%;
                    max-width: 600px;
                    height: 100%;
                    max-height: 600px;
                    min-width: 400px;
                    min-height: 400px;
                    background: var(--background-yellow);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    font-size: 1rem;
                    color: #333;
                    box-sizing: border-box;
                }

                button {
                    all: unset;
                }

                .heading {
                    font-size: 2rem;
                    margin-bottom: 20px;
                }

                .login {
                    width: 100%;
                    text-align: center;
                }

                .flex-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 10px;
                }

                .group {
                    width: 100%;
                    max-width: 500px;
                }

                .label {
                    margin-bottom: 5px;
                    font-size: 1.2rem;
                    text-align: left;
                }

                .input-field {
                    padding: 10px;
                    font-size: 1rem;
                    width: 100%;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }

                input {
                    outline: none;
                }

                .sign-in-button {
                    width: 100%;
                    padding: 10px;
                    background-color: black;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 1.2rem;
                }

                .sign-in-button:hover {
                    background-color: #333;
                }

                .account-links {
                    margin-top: 10px;
                    font-size: 0.9rem;
                    color: #333;
                    margin-bottom: 30px;
                    font-family: monospace;
                }

                .account-links a {
                    color: blue;
                    text-decoration: none;
                }

                .account-links a:hover {
                    text-decoration: underline;
                }

                .margin-top {
                    margin-top: 30px;
                }

                .auth-button {
                    margin-top: 10px;
                    width: 100%;
                    padding: 10px;
                    background-color: black;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 1.2rem;
                }

                .auth-button:hover {
                    background-color: #333;
                }

                .register {
                    text-align: center;
                    width: 100%;
                }

                .otp {
                    text-align: center;
                    width: 100%;
                }

                .error-message {
                    color: red;
                    font-size: 0.9rem;
                    height: 15px; /* Fixed height to reserve space */
                    margin-top: 5px;
                    text-align: left;
                    visibility: hidden; /* Hidden by default, made visible when an error occurs */
                }

                .otp-input-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }

                .otp-box {
                    width: 40px;
                    height: 40px;
                    text-align: center;
                    font-size: 18px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }

                #qr-code {
                    width: 200px;
                    height: 200px;
                    border-radius: 15px;
                    border: 2px solid #000;
                    margin: 20px auto;
                    object-fit: contain;
                }

                .player-input {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    padding-left: 15px; /* Must Match the remove button's offset */
                }

                #player-inputs {
                    padding-left: 20px;
                }

                .player-input input[type="text"] {
                    flex: 1;
                }

                .player-input label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .player-inputs {
                    max-height: 500px;
                    width: 500px;
                    overflow-y: auto;
                }

                .remove-player-button {
                    position: absolute;
                    left: -10px;
                    background: #ff4d4d;
                    border: none;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 50%;
                    font-size: 0.5rem;
                    line-height: 1;
                }

                .remove-player-button:hover {
                    background: #e60000;
                }

                .ai-difficulty {
                    margin-top: 10px;
                    margin-right: 5px;
                }

                .ai-difficulty label {
                    font-size: 0.5rem;
                }

                #ai-difficulty-slider {
                    width: 100%;
                }

                .disclaimer {
                    font-size: 0.4rem;
                    text-align: right;
                }

                .round-heading {
                    text-align: left;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .match-box {
                    background-color: #f0f0f0;
                    margin: 5px 0;
                    padding: 5px;
                    border-radius: 5px;
                }
                .match {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: monospace; /* Monospace font for consistent character widths */
                }
                .player-name {
                    width: 110px;
                    text-align: center;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .score {
                    width: 40px;
                    text-align: center;
                }
                .vs {
                    width: 30px;
                    text-align: center;
                }
                .winner {
                    color: green;
                    font-weight: bold;
                }
                .loser {
                    color: red;
                }
                .tournament-standings {
                    margin-top: 10px;
                    max-height: 500px;
                    overflow-y: auto;
                }
            </style>
            <div class="menu-option">
                <button style="text-align: right">vs AI</button>
                <span class="button-description">don’t worry, its not chatGPT</span>
            </div>
            <div class="menu-option">
                <button style="text-align: right">local</button>
                <span class="button-description">one keyboard? just dont elbow each other</span>
            </div>
            ${getAccessToken() ? `
                <div class="menu-option">
                    <button style="text-align: right">tournament</button>
                    <span class="button-description">gather your friends or face off against bots</span>
                </div>
                ` : ""}
        `
    }

    setupEventListeners() {
        const gameplayOptions = this.shadowRoot.querySelectorAll(".menu-option");
        gameplayOptions.forEach((option) => {
            // Used for cursor hover effects
            option.addEventListener("mouseover", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: option });
            });
            option.addEventListener("mouseout", () => {
                GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: option});
            });

            // local click event
            option.addEventListener('click', (event) => {
                const buttonText = event.target.textContent.trim();
                if (buttonText === "vs AI") {
                    GlobalEventEmitter.emit(EVENT_TYPES.MATCH_VS_AI);
                } else if (buttonText === "local") {
                    GlobalEventEmitter.emit(EVENT_TYPES.MATCH_LOCAL);
                } else if (buttonText === "tournament") {
                    GlobalEventEmitter.emit(EVENT_TYPES.MATCH_TOURNAMENT);
                }
            });
        });
    }
}

customElements.define('play-menu', PlayMenu);