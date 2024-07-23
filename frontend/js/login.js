var loginModal = document.getElementById("login-modal");
var loginButton = document.getElementById("login-button");
var closeButton = document.getElementsByTagName("close-button");
var ToRegisterButton = document.getElementById("GoToRegister-button");
var ToSignInButton = document.getElementById("GoToSignIn-button");
var registerModal = document.getElementById("register-modal");
let registerButton = document.querySelector("#register-button");
let registerInputUsername = document.querySelector("#registeruname");
let registerInputPassword = document.querySelector("#registerpwd");
let registerInputPassword2 = document.querySelector("#registerpwd2");

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

registerButton.addEventListener("click", async function(e){
	document.querySelector("#incorrectPasswords").style.visibility = "hidden";
	let valid = document.querySelector("#register-form").checkValidity();
	// console.log("valid: " + valid);
	if (!valid){
		return ;
	}
	e.preventDefault();
	console.log(e);
	let username = registerInputUsername.value;
	let password = registerInputPassword.value;
	let password2 = registerInputPassword2.value;
	console.log("username is: " , username);
	console.log("password is: " , password);
	console.log("password2 is: " , password2);

	const comparePassword = password.localeCompare(password2);
	if (comparePassword != 0){
		inequalPassword();
		return ;
	}
	console.log("Passwords are matching :)");

	// send data to backend

	// const obj = {name: "John", age: 30, city: "New York"};
	const data = {"username": username, "email": "default", "password": password};
	console.log(data);

	//URL: /api/auth/register/  Method: POST
	
	try {
		const response = await fetch("http://127.0.0.1:80/api/auth/register/", {
		  method: "POST",
		  // Set the FormData instance as the request body
		  body: data,
		});
		console.log(await response.json());
	  } catch (e) {
		console.error(e);
	  }

	registerModal.style.display = "none";
	console.log("You are successfully registered !");
})

// loginButton.addEventListener("click", async function (e) {
	
// })

function inequalPassword(){
	console.log("PASSWORDS DONT MATCH");
	let passwordWarning = document.querySelector("#incorrectPasswords");
	passwordWarning.style.visibility = "visible";
}

