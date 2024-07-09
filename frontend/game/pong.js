// const canvas = document.getElementById('pongCanvas');
// const ctx = canvas?.getContext('2d');
//
// const lobbyId = window.location.pathname.split('/').pop()
// const ws = new WebSocket(`ws://127.0.0.1:8000/ws/game/${lobbyId}`);
//
// ws.onopen = (event) => {
// 	console.log("Websocket is now open!", event);
// }
//
// ws.onclose = (event) => {
// 	console.log("Websockets connection closed!");
// }
//
// ws.onerror = (event) => {
// 	console.error("Websocket error observed: ", event)
// }
//
// ws.onmessage = (event) => {
// 	gameState = JSON.parse(event.data);
// 	console.log("Got new message: ", gameState);
//
// 	if (data.type == 'game') {
// 		console.log('Game state: ', data.message);
// 		updateGame(data.message);
// 	}
// }
//
// const updateGame = (gameState) => {
// 	if (ctx) {
// 		ctx.clearRect(0, 0, canvas.width, canvas.height);
//
// 		// Draw background
// 		ctx.fillStyle = "#1b1b1b";
// 		ctx.fillRect(0,0, canvas.width, canvas.height);
//
// 		// Draw paddles
// 		ctx.fillStyle = "white";
// 		ctx.fillRect(gameState.paddle1.x,gameState.paddle1.y, 10, 75);
// 		ctx.fillRect(gameState.paddle2.x,gameState.paddle2.y, 10, 75);
//
// 		// Draw ball
// 		ctx.beginPath()
// 		ctx.arc(gameState.ball_position.x, gameState.ball_position.y, gameState.ball_position.radius, 0, Math.PI*2);
// 		ctx.fillStyle = "#0095DD";
// 		ctx.fill();
// 		ctx.closePath();
// 	} else {
// 		console.error("Canvas not found or not initialized");
// 	}
// }
//
// document.addEventListener("keydown", (event) => {
// 	let action;
// 	if (event.code === "KeyW") {
// 		ws.send(JSON.stringify({
//             action: 'move_paddle',
// 			player: player,
// 			direction: 'up'
//         }));
// 	} else if (event.code === "KeyS") {
// 		ws.send(JSON.stringify({
//             action: 'move_paddle',
// 			player: player,
// 			direction: 'up'
//         }));
// 	}
// 	if (action) {
// 		ws.send(JSON.stringify(action))
// 	}
// })
