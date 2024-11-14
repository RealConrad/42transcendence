// TODO: DELETE THIS CODE - Temporary to get 2 unique users
var y = Math.random();
if (y < 0.5)
  y = 1;
else
  y= 2;
const player = "player" + y;
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


const gameLoop = (currentTime) => {
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // convert to seconds
    lastUpdateTime = currentTime;
    if (gameState) {
        updateGame(deltaTime);
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

const updateAndDrawPaddles = (deltaTime) => {
    ['player1', 'player2'].forEach(player => {
        const paddle = gameState.players_data[player].paddle;
        const velocityY = gameState.players_data[player].y = paddle.y;

        // Update interpolated paddle data
        if (!interpolatedPaddlePositions[player].y) {
            interpolatedPaddlePositions[player].y = paddle.y;
        } else {
            interpolatedPaddlePositions[player].y += velocityY * deltaTime;
        }
        // Clamp position between canvas boundaries
        interpolatedPaddlePositions[player].y = Math.max(
            0,
            Math.min(canvas.height - paddle.hieght, interpolatedPaddlePositions[player].y)
        );
        ctx.fillStyle = "red"; // TODO: This is temporary, change this
        ctx.fillRect(
            paddle.x,
            interpolatedPaddlePositions[player].y,
            paddle.width,
            paddle.height
        );
    });
}

const updateAndDrawBall = (deltaTime) => {
    const ball = gameState.ball_data;
    const velocityX = ball.velocity.x;
    const velocityY = ball.velocity.y;

    // Interpolate ball position
    if (!interpolatedBallPosition.x || !interpolatedBallPosition.y) {
        interpolatedBallPosition.x = ball.position.x;
        interpolatedBallPosition.y = ball.position.y;
    } else {
        interpolatedBallPosition.x = velocityX * deltaTime;
        interpolatedBallPosition.y = velocityY * deltaTime;
    }

    ctx.beginPath();
    ctx.arc(interpolatedBallPosition.x, interpolatedBallPosition.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red"
    ctx.fill();
    ctx.closePath();
}

const updateGame = (deltaTime) => {
    if (!ctx) {
        console.error("Canvas context not found!");
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateAndDrawPaddles(deltaTime);
    updateAndDrawBall(deltaTime);
}

const startGame = (lobbyID) => {

    const updateScores = (scores) => {
        document.getElementById('player1Score').innerHTML = scores.player1;
        document.getElementById('player2Score').innerHTML = scores.player2;
    }

    if (canvas) {
        canvas.style.display = 'block';
    }

    const ws = new WebSocket(`ws://127.0.0.1:8002/ws/game/${lobbyID}/`);

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

        if (data.type === 'game_state') {
            gameState = data.message;
            updateScores(gameState.scores);
            interpolatedBallPosition.x = gameState.ball_data.position.x;
            interpolatedBallPosition.y = gameState.ball_data.position.y;
            ['player1', 'player2'].forEach(player => {
                interpolatedPaddlePositions[player].y = gameState.players_data[player].paddle.y;
            });
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
            direction: direction
        })));
    }

    const sendPaddleStop = () => {
        ws.send(JSON.stringify({
            action: 'stop_paddle',
            player: player
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
            console.log("Match found with game ID:", gameId);
            // proceed to start the game
            // startGame(gameId)
        } else if (data.status === 'waiting_in_queue') {
            console.log("Waiting in queue for an opponent");
        }
    };

    matchmakingSocket.onclose = (e) => {
        console.log('Matchmaking WebSocket connection closed');
    };
}

document.getElementById('startMatchmakingBtn').addEventListener('click', startMatchmaking);
