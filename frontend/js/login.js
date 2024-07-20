var loginModal = document.getElementById("login-modal");
var loginButton = document.getElementById("login-button");
var closeButton = document.getElementsByTagName("close-button");
var ToRegisterButton = document.getElementById("GoToRegister-button");
var ToSignInButton = document.getElementById("GoToSignIn-button");
var registerModal = document.getElementById("register-modal");

loginButton.onclick = function() {
	console.log("clicked loginButton :))");
	loginModal.style.display = "block";
}
closeButton[0].onclick = function() {
	console.log("Login:  clicked close Button");
	loginModal.style.display = "none";
}
closeButton[1].onclick = function() {
	console.log("Registration: clicked close Button");
	registerModal.style.display = "none";
}
ToRegisterButton.onclick = function(){
	console.log("clicked register buttoooon");
	loginModal.style.display = "none";
	registerModal.style.display = "block";
}
ToSignInButton.onclick = function(){
	console.log("clicked go to sign in button");
	registerModal.style.display = "none";
	loginModal.style.display = "block";
}