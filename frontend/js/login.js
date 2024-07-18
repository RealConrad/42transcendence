var loginModal = document.getElementById("login-modal");
var loginButton = document.getElementById("login-button");
var closeButton = document.getElementsById("close-button");

closeButton[0].style.backgroundColor = "black";

loginButton.onclick = function() {
	console.log("clicked loginButton :))");
	loginModal.style.display = "block";
	}
	
	closeButton[0].onclick = function() {
		console.log("clicked close button of login page");
		loginModal.style.display = "none";
		}



var registerModal = document.getElementById("register-modal");
var registerLink = document.getElementById("registerButton");

registerLink.addEventListener("click", function (){
	alert("i am clicked yay");
	console.log("wtf");
});

// registerLink.onclick = function(){
// 	console.log("this registration link was clicked hihi");
// }