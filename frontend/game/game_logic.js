// TODO: DELETE THIS CODE - Temporary to get 2 unique users
var y = Math.random();
if (y < 0.5)
  y = 1;
else
  y= 2;
const player = "player" + y;
let player_id;
console.log("PLAYER: ", player);

const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
let gameState = null; // Holds the latest game state received from the backend
let lastUpdateTime = performance.now();
let interpolatedBallPosition = {x: 0, y: 0};
let interpolatedPaddlePositions = {
    player1: {x: 0, y: 0},
    player2: {x: 0, y: 0}
}
let keyPressed = {} // keeps track of which keys are pressed

const updateGame = (gameState) => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = "#1b1b1b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw paddles
        ctx.fillStyle = "red";
        //console.log(gameState.paddle_data);

        // Player 1
        player1_paddle = gameState.state.player1.paddle
        ctx.fillRect(player1_paddle.x, player1_paddle.y, player1_paddle.width, player1_paddle.height);

        // player 2
        player2_paddle = gameState.state.player2.paddle
        ctx.fillRect(player2_paddle.x, player2_paddle.y, player2_paddle.width, player2_paddle.height);

        // Draw ball
        ctx.beginPath();
        ctx.arc(gameState.state.ball.x, gameState.state.ball.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    } else {
        console.error("Canvas not found or not initialized");
    }
};

const startGame = (game_id) => {

    const updateScores = (gameState) => {
        document.getElementById('player1Score').innerHTML = gameState.state.player1.score;
        document.getElementById('player2Score').innerHTML = gameState.state.player2.score;
    }

    if (canvas) {
        canvas.style.display = 'block';
    }

    const ws = new WebSocket(`ws://127.0.0.1:8002/ws/game/${game_id}/`);

    ws.onopen = (event) => {
        console.log("Websocket is now open!", event);
    };

    ws.onclose = (event) => {
        console.log("Websockets connection closed!");
    };

    ws.onerror = (event) => {
        console.error("Websocket error observed: ", event);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log(data)

        if (data.type === 'game_state') {
            gameState = data;
            updateScores(gameState);
            updateGame(gameState)
        }
        else if (data.type === 'game_over') {
            console.log(data.message.winner + " has won!");
        }
    };

    const sendPaddleMove = () => {
        let direction;
        if (keyPressed["KeyW"]) {
            direction = 'up';
        } else if (keyPressed["KeyS"]) {
            direction = 'down';
        } else {
            return;
        }
        ws.send(JSON.stringify(({
            action: 'move_paddle',
            player: player,
            player_id: player_id,
            direction: direction,
        })));
    }

    const sendPaddleStop = () => {
        ws.send(JSON.stringify({
            action: 'stop_paddle',
            player: player,
            player_id: player_id
        }));
    }

    document.addEventListener("keydown", (event) => {
        if (event.code === "KeyW" || event.code === "KeyS") {
            if (!keyPressed[event.code]) {
                keyPressed[event.code] = true;
                sendPaddleMove();
            }
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.code === "KeyW" || event.code === "KeyS") {
            if (keyPressed[event.code]) {
                keyPressed[event.code] = false;
                sendPaddleStop();
            }
        }
    });
}

const startMatchmaking = () => {
    console.log("Starting matchmaking...");
    const matchmakingSocket = new WebSocket("ws://127.0.0.1:8002/ws/matchmaking/");

    matchmakingSocket.onopen = () => {
        console.log("Matchmaking socket connection established");

        matchmakingSocket.send(JSON.stringify({
            action: 'join_queue',
            username: player
        }));
    };

    matchmakingSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log("Message received: ", data);
        if (data.type === 'match_found') {
            const gameId = data.message.game_id;
            player_id = data.message.player_id;
            console.log("Match found with game ID:", gameId);
            startGame(gameId)
        } else if (data.status === 'waiting_in_queue') {
            console.log("Waiting in queue for an opponent");
        }
    };

    matchmakingSocket.onclose = (e) => {
        console.log('Matchmaking WebSocket connection closed');
    };
}

document.getElementById('startMatchmakingBtn').addEventListener('click', startMatchmaking);
