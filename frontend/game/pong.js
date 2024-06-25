const canvas = document.getElementById('pongCanvas');
const ctx = canvas?.getContext('2d');

const ws = new WebSocket('ws://127.0.0.1:8000/ws/pong/');

let gameState = {
	paddle1: {"x": Number, "y": Number, "width": Number, "height": Number},
	paddle2: {"x": Number, "y": Number, "width": Number, "height": Number},
	ball: {"x": Number, "y": Number, "dx": Number, "dy": Number, "radius": Number},
}

ws.onopen = (event) => {
	console.log("Websocket is now open!", event);
}

ws.onclose = (event) => {
	console.log("Websockets connection closed!");
}

ws.onerror = (event) => {
	console.error("Websocket error observed: ", event)
}

ws.onmessage = (event) => {
	gameState = JSON.parse(event.data);
	console.log("Got new message: ", gameState);
	draw();
}

const draw = () => {
	if (ctx) {
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw background
		ctx.fillStyle = "#1b1b1b";
		ctx.fillRect(0,0, canvas.width, canvas.height);

		// Draw paddles
		ctx.fillStyle = "white";
		ctx.fillRect(gameState.paddle1.x,gameState.paddle1.y, 10, 75);
		ctx.fillRect(gameState.paddle2.x,gameState.paddle2.y, 10, 75);

		// Draw ball
		ctx.beginPath()
		ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI*2);
		ctx.fillStyle = "#0095DD";
		ctx.fill();
		ctx.closePath();
	} else {
		console.error("Canvas not found or not initialized yet!");
	}
}

document.addEventListener("keydown", (event) => {
	let action;
	if (event.code === "KeyW") {
		action = {action: 'move_paddle', paddle: "paddle1", direction: "up"};
	} else if (event.code === "KeyS") {
		action = {action: 'move_paddle', paddle: "paddle1", direction: "up"};
	}
	if (action) {
		ws.send(JSON.stringify(action))
	}
})

// const test = () => {
// 	if (ctx) {
// 		const { width, height } = canvas.getBoundingClientRect()
// 		console.log("WIDTH: " + width)
// 		console.log("HEIGHT: " + height)
// 		ctx.fillStyle = "#1b1b1b";
// 		ctx.fillRect(0,0, width, height);
//
// 		// Draw paddles
// 		drawPaddle(paddle1X, paddle1Y);
// 		drawPaddle(paddle2X, paddle2Y);
//
// 	} else {
// 		console.error("Cannot find canvas");
// 	}
// }
//
// window.onload = () => {
// 	test();
// }
