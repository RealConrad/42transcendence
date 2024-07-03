//frame
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); 

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

console.log(canvas.width, canvas.height);



function drawMiddleLine() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]); // 10px dash, 10px gap
    ctx.beginPath();
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.moveTo(canvas.width / 2 - 2, y);
        ctx.lineTo(canvas.width / 2 + 2, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash to solid
}


document.addEventListener('DOMContentLoaded', function() {
	const canvas = document.getElementById('gameCanvas');
	const leftPaddle = createPaddle();
	const rightPaddle = createPaddle();
	const leftMenuOptions = document.querySelector('left-menu').querySelectorAll('.menu-option');
	const rightMenuOptions = document.querySelector('right-menu').querySelectorAll('.menu-option');
  
	function createPaddle() {
	  const paddle = document.createElement('div');
	  paddle.classList.add('paddle');
	  document.body.appendChild(paddle);
	  return paddle;
	}
  
	function updatePaddlePositions() {
	  const canvasRect = canvas.getBoundingClientRect();
	  const paddleHeight = canvasRect.height * 0.1; // 10% of the canvas height
	  [leftPaddle, rightPaddle].forEach(paddle => {
		paddle.style.height = `${paddleHeight}px`;
	  });
  
	  positionPaddlesAtCanvasEdges(canvasRect, paddleHeight);
	}
  
	function positionPaddlesAtCanvasEdges(canvasRect, paddleHeight) {
	  leftPaddle.style.left = `${canvasRect.left - leftPaddle.offsetWidth}px`;
	  rightPaddle.style.left = `${canvasRect.right}px`;
	  leftPaddle.style.top = rightPaddle.style.top = `${canvasRect.top + (canvasRect.height - paddleHeight) / 2}px`;
	}
  
	function stickPaddleToMenuOption(paddle, option) {
	  const optionRect = option.getBoundingClientRect();
	  paddle.style.top = `${optionRect.top + optionRect.height / 2 - paddle.offsetHeight / 2}px`;
	}
  
	leftMenuOptions.forEach(option => {
	  option.addEventListener('mouseenter', () => stickPaddleToMenuOption(leftPaddle, option));
	//   option.addEventListener('mouseleave', () => updatePaddlePositions());
	});
  
	rightMenuOptions.forEach(option => {
	  option.addEventListener('mouseenter', () => stickPaddleToMenuOption(rightPaddle, option));
	//   option.addEventListener('mouseleave', () => updatePaddlePositions());
	});
  
	updatePaddlePositions();
	window.addEventListener('resize', updatePaddlePositions);
  
	document.addEventListener('mousemove', function(e) {
	  if (!e.target.closest('.menu-option')) {
		const canvasRect = canvas.getBoundingClientRect();
		const paddleHeight = parseFloat(leftPaddle.style.height);
		const mouseY = e.clientY - canvasRect.top - paddleHeight / 2;
  
		if (mouseY >= 0 && mouseY + paddleHeight <= canvasRect.height) {
		  if (e.clientX < window.innerWidth / 2) {
			leftPaddle.style.top = `${mouseY + canvasRect.top}px`;
		  } else {
			rightPaddle.style.top = `${mouseY + canvasRect.top}px`;
		  }
		}
	  }
	});
  });
  

  document.addEventListener('DOMContentLoaded', function() {
	const leftMenuOptions = document.querySelectorAll('left-menu .menu-option');
	const rightMenuContainer = document.getElementById('right-menu-container');
	
	// Define the mapping of left menu option index to HTML file paths
	const rightMenuFiles = {
		0: '../rightside/howto.html',
		1: '../rightside/play.html',
		2: '../rightside/tournament.html',
		3: '../rightside/leaderboard.html',
		4: '../rightside/about.html',
		5: '../rightside/account.html',
	};
  
	let currentIndex = null;
  
	leftMenuOptions.forEach((leftOption, index) => {
	  leftOption.addEventListener('mouseover', () => {
		if (currentIndex !== index) {
		  loadRightMenuContent(index);
		  highlightLeftOption(index);
		  currentIndex = index;
		}
	  });
	});
  
	rightMenuContainer.addEventListener('mouseleave', () => {
	  unhighlightLeftOptions();
	  currentIndex = null;
	});
  
	function loadRightMenuContent(index) {
	  const filePath = rightMenuFiles[index];
	  if (filePath) {
		fetch(filePath)
		  .then(response => response.text())
		  .then(data => {
			rightMenuContainer.innerHTML = data;
		  })
		  .catch(error => {
			console.error('Error fetching HTML content:', error);
		  });
	  }
	}
  
	function highlightLeftOption(index) {
	  unhighlightLeftOptions();
	  leftMenuOptions[index].classList.add('highlighted');
	}
  
	function unhighlightLeftOptions() {
	  leftMenuOptions.forEach(option => {
		option.classList.remove('highlighted');
	  });
	}
  });
  

  drawMiddleLine();

window.addEventListener('resize', function() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawMiddleLine();  // Your function to redraw the line
});