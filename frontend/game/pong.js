const canvas = document.getElementById('pongCanvas');
const ctx = canvas?.getContext('2d');

const test = () => {
	if (ctx) {
		const { width, height } = canvas.getBoundingClientRect()
		console.log("WIDTH:" + width)
		console.log("HEIGHT: " + height)
		ctx.fillStyle = "#8F5549";
		ctx.fillRect(0,0, width, height);

	} else {
		console.error("Cannot find canvas");
	}
}

window.onload = () => {
	test();
}
