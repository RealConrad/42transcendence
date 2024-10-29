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

    // TODO: Add onmessage event




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
    const matchMakingSocket = new WebSocket("ws://127.0.0.1:8002/ws/matchmaking/");

    matchMakingSocket.onopen(() => {
        console.log("Matchmaking socket connection established");

        matchMakingSocket.send(JSON.stringify({
            action: 'join_queue',
            username: 'player'
        }));
    });

    matchMakingSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'match_found') {
            console.log("Match found: ", data.message);
            startGame(data.message.message.id);
        }
    }
    matchMakingSocket.onclose = (e) => {
        console.log('Matchmaking WebSocket connection closed');
    };
}

document.getElementById('startMatchmakingBtn').addEventListener('click', startMatchmaking);

// ------------------- OLD CODE:

// const startMatchmaking = () => {
//     console.log("Trying to setup connection....");
//     const matchmakingSocket = new WebSocket('ws://127.0.0.1:8002/ws/matchmaking/');
//
//     matchmakingSocket.onopen = () => {
//         console.log("Matchmaking socket connection established");
//
//         matchmakingSocket.send(JSON.stringify({
//             action: 'join_queue',
//             username: player,
//         }));
//     };
//
//     matchmakingSocket.onmessage = (e) => {
//         const data = JSON.parse(e.data);
//         //console.log('Message received: ', data);
//
//         if (data.type === 'match_found') {
//              // console.log("Match found: ", data.message);
//             startGame(data.message.message.id);
//         }
//     };
//
//     matchmakingSocket.onclose = function(e) {
//         console.log('Matchmaking WebSocket connection closed');
//     };
// };
//
// const startGame = (lobbyId) => {
//     const canvas = document.getElementById('pongCanvas');
//     const ctx = canvas.getContext('2d');
//     canvas.style.display = 'block';
//
//     const ws = new WebSocket(`ws://127.0.0.1:8002/ws/game/${lobbyId}/`);
//
//     ws.onopen = (event) => {
//         console.log("Websocket is now open!", event);
//     };
//
//     ws.onclose = (event) => {
//         console.log("Websockets connection closed!");
//     };
//
//     ws.onerror = (event) => {
//         console.error("Websocket error observed: ", event);
//     };
//
//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//
//         if (data.type === 'game_state') {
//             updateGame(data.message);
//             updateScores(data.message.scores);
//         }
//         else if (data.type == 'game_over') {
//             console.log(data.message.winner + " has won!");
//         }
//     };
//
//     const updateScores = (scores) => {
//         document.getElementById('player1Score').innerHTML = scores.player1;
//         document.getElementById('player2Score').innerHTML = scores.player2;
//     }
//
//     const updateGame = (gameState) => {
//         if (ctx) {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//             // Draw background
//             ctx.fillStyle = "#1b1b1b";
//             ctx.fillRect(0, 0, canvas.width, canvas.height);
//
//             // Draw paddles
//             ctx.fillStyle = "red";
//             //console.log(gameState.paddle_data);
//
//             // Player 1
//             ctx.fillRect(gameState.players_data.player1.paddle.x, gameState.players_data.player1.paddle.y,
//                 gameState.players_data.player1.paddle.width, gameState.players_data.player1.paddle.height);
//
//             // Player 2
//             ctx.fillRect(gameState.players_data.player2.paddle.x, gameState.players_data.player2.paddle.y,
//                 gameState.players_data.player2.paddle.width, gameState.players_data.player2.paddle.height);
//
//             // Draw ball
//             ctx.beginPath();
//             ctx.arc(gameState.ball_data.position.x, gameState.ball_data.position.y, 10, 0, Math.PI * 2);
//             ctx.fillStyle = "red";
//             ctx.fill();
//             ctx.closePath();
//         } else {
//             console.error("Canvas not found or not initialized");
//         }
//     };
//
//     document.addEventListener("keydown", (event) => {
//         let action;
//         if (event.code === "KeyW") {
//             action = {
//                 action: 'move_paddle',
//                 player: player,
//                 direction: 'up'
//             };
//         } else if (event.code === "KeyS") {
//             action = {
//                 action: 'move_paddle',
//                 player: player,
//                 direction: 'down'
//             };
//         }
//         if (action) {
//             ws.send(JSON.stringify(action));
//         }
//     });
// };
//
// document.getElementById('startMatchmakingBtn').addEventListener('click', startMatchmaking);
