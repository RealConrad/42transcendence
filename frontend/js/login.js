var modal = document.getElementById("login-modal");
var loginButton = document.getElementById("login-button");
var closeButton = document.getElementById("close-button");

closeButton.style.backgroundColor = "black";

loginButton.onclick = function() {
	console.log("clicked loginButton :))");
	modal.style.display = "block";
}

closeButton.onclick = function() {
	console.log("clicked close button of login page");
	modal.style.display = "none";
}