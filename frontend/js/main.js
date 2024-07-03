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
  
	leftMenuOptions.forEach((leftOption, index) => {
	  leftOption.addEventListener('mouseover', () => {
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
	  });
	});
  });
