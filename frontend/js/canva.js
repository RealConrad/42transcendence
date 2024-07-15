//frame
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); 

canvas.width = document.querySelector('main-menu').clientWidth;
canvas.height = document.querySelector('main-menu').clientHeight;

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
	const rightMenuContainer = document.getElementById('right-menu-container');
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
  
	rightMenuContainer.addEventListener('mouseover', event => {
        const option = event.target.closest('.menu-option');
        if (option) {
            stickPaddleToMenuOption(rightPaddle, option);
        }
    });

    // Use event delegation for statically loaded content in the left-menu
    document.querySelector('left-menu').addEventListener('mouseover', event => {
        const option = event.target.closest('.menu-option');
        if (option) {
            stickPaddleToMenuOption(leftPaddle, option);
        }
    });

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
  
	// rightMenuContainer.addEventListener('mouseleave', () => {
	//   unhighlightLeftOptions();
	//   currentIndex = null;
	// });
  
	function loadRightMenuContent(index) {
	  const filePath = rightMenuFiles[index];
	  if (filePath) {
		fetch(filePath)
		  .then(response => response.text())
		  .then(data => {
			rightMenuContainer.innerHTML = data;
			if (index === 0)
				initializePowerElements();
		  })
		  .catch(error => {
			console.error('Error fetching HTML content:', error);
		  });
	  }
	}
  
	function highlightLeftOption(index) {
	  unhighlightLeftOptions();
	  const button = leftMenuOptions[index].querySelector('button');
	  button.classList.add('glowing-effect');
	}
  
	function unhighlightLeftOptions() {
		leftMenuOptions.forEach(option => {
		  const button = option.querySelector('button');
		  button.classList.remove('glowing-effect');
		});
	}
  });
  
 // mouse shake effects

 document.addEventListener('DOMContentLoaded', () => {
    const afterImage = document.createElement('div');
    afterImage.className = 'cursor-after-image';
    document.body.appendChild(afterImage);

    const afterAfterImage = document.createElement('div');
    afterAfterImage.className = 'cursor-after-image';
    document.body.appendChild(afterAfterImage);

    document.addEventListener('mousemove', (e) => {
        afterImage.style.left = `${e.pageX}px`;
        afterImage.style.top = `${e.pageY}px`;
        afterAfterImage.style.left = `${e.pageX}px`;
        afterAfterImage.style.top = `${e.pageY}px`;
    });

    // Setup event delegation on right-menu-container
    const rightMenuContainer = document.getElementById('right-menu-container');

    rightMenuContainer.addEventListener('mouseenter', (event) => {
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
            afterImage.classList.add('after-image-shake', 'enlarged', 'blue');
            afterAfterImage.classList.add('after-image-after-shake', 'enlarged', 'green');
        }
    }, true); // Use capture phase for catching events

    rightMenuContainer.addEventListener('mouseleave', (event) => {
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
            afterImage.classList.remove('after-image-shake', 'enlarged', 'blue');
            afterAfterImage.classList.remove('after-image-after-shake', 'enlarged', 'green');
        }
    }, true); // Use capture phase for catching events
});

  // mouse move effects
  document.addEventListener('DOMContentLoaded', () => {
    let lastX, lastY;
    let afterImage = document.createElement('div');
    afterImage.className = 'cursor-after-image';
    document.body.appendChild(afterImage);

    document.addEventListener('mousemove', (e) => {
        if (lastX !== undefined && lastY !== undefined) {
            const dx = e.pageX - lastX; // Calculate difference in X
            const dy = e.pageY - lastY; // Calculate difference in Y

            // Calculate new position for the after-image in the opposite direction of movement
            const newX = e.pageX - dx * 0.3; // Multiplier '2' extends the effect to the opposite side
            const newY = e.pageY - dy * 0.3;

            afterImage.style.left = `${newX}px`; // Position after-image on the opposite side
            afterImage.style.top = `${newY}px`;
        }

        // Update last positions
        lastX = e.pageX;
        lastY = e.pageY;
    });
});


// howTo
const atkPowers = [
	{ symbol: "%", title: "The Paddle Games", desc: "Teleport the ball to the other side mirroring its origin position and direction." },
	{ symbol: ">", title: "Run Ball, Run!", desc: "Increase the ball speed by x3 until a point gets scored." },
	{ symbol: "&", title: "No U!", desc: "Reverses the direction of the ball and increase its speed x2 until a point gets scored." },
	{ symbol: "-", title: "Honey, I Shrunk the Paddle", desc: "Halves the size of opponent's paddle until he loses a point." },
	{ symbol: "¿", title: "Down is the new Up", desc: "Reverses up and down keys of an opponent until a point is scored or 5 seconds." }
];

const defPowers = [
	{ symbol: "|", title: "You Shall Not Pass!", desc: "Your paddle becomes the size of the whole game area for 2 seconds or until it deflects the ball with 2x speed for remaining time." },
	{ symbol: "@", title: "Get Over Here!", desc: "You pull the ball to your paddle. It will stick to it for 1s and then shoot straight with 4x speed for 1 second." },
	{ symbol: "+", title: "Paddle STRONG!", desc: "Your paddle doubles in size until point scored." },
	{ symbol: "*", title: "Slow-Mo", desc: "The ball slows down for 2 seconds or until hits a paddle and then increases speed x2 for a duration of slow-mo part." },
	{ symbol: "=", title: "For Justice!", desc: "Teleports paddles of both players to a position of a ball and freezes them in place for 1 second." }
];

function createPowerElement(power, container) {
	let powerDiv = document.createElement('div');
	powerDiv.className = 'power';
	powerDiv.style.setProperty('--animation-delay-delay', `${Math.random() * 0.5}s`); // Random delay for demo

	let powerText = document.createElement('div');
	powerText.className = 'power-text';
	powerText.textContent = power.symbol;

	let afterImage = document.createElement('div');
	afterImage.className = 'after-image';

	let afterShake = document.createElement('div');
	afterShake.className = 'after-shake';

	let afterAfterShake = document.createElement('div');
	afterAfterShake.className = 'after-after-shake';

	powerDiv.appendChild(powerText);
	powerDiv.appendChild(afterImage);
	powerDiv.appendChild(afterShake);
	powerDiv.appendChild(afterAfterShake);

	powerDiv.addEventListener('mouseover', () => {
		document.getElementById('power-title').textContent = power.title;
		document.getElementById('description').textContent = power.desc;
	});

	powerDiv.addEventListener('mouseleave', () => {
		document.getElementById('power-title').textContent = 'HowTo?';
		document.getElementById('description').innerHTML = 'Collect Powers and use them with ATK and DEF keys!<br>Hover over the powers to see their descriptions.';
	});

	container.appendChild(powerDiv);
}

function initializePowerElements() {
    const atkContainer = document.querySelector('.atk-powers');
    const defContainer = document.querySelector('.def-powers');

    // Assuming `atkPowers` and `defPowers` are globally accessible or passed to this function
    atkPowers.forEach(power => createPowerElement(power, atkContainer));
    defPowers.forEach(power => createPowerElement(power, defContainer));
}


  // Draw the middle line

  drawMiddleLine();

window.addEventListener('resize', function() {
	canvas.width = document.querySelector('main-menu').clientWidth;
	canvas.height = document.querySelector('main-menu').clientHeight;
    drawMiddleLine();  // Your function to redraw the line
});