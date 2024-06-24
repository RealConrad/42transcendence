const canvas = document.getElementById('pongCanvas');
const ctx = canvas?.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 80;

const paddle1X = 10; // Left paddle
const paddle2X = canvas.width - paddleWidth - 10; // Right paddle

let paddle1Y = (canvas.height - paddleHeight) / 2; //center paddle vertically
let paddle2Y = (canvas.height - paddleHeight) / 2; //center paddle vertically


const drawPaddle = (x, y) => {
	ctx.fillStyle = "#0095DD";
	ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

const test = () => {
	if (ctx) {
		const { width, height } = canvas.getBoundingClientRect()
		console.log("WIDTH: " + width)
		console.log("HEIGHT: " + height)
		ctx.fillStyle = "#1b1b1b";
		ctx.fillRect(0,0, width, height);

		// Draw paddles
		drawPaddle(paddle1X, paddle1Y);
		drawPaddle(paddle2X, paddle2Y);

	} else {
		console.error("Cannot find canvas");
	}
}

window.onload = () => {
	test();
}
