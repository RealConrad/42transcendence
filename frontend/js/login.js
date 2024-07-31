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
let signinButton = document.querySelector("#signin-button");
let loginInputUsername = document.querySelector("#loginuname");
let loginInputPassword = document.querySelector("#loginpwd");

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

//REGISTRATION
registerButton.addEventListener("click", async function(e){
	document.querySelector("#incorrectPasswords").style.visibility = "hidden";
	let valid = document.querySelector("#register-form").checkValidity();
	if (!valid){
		return ;
	}
	e.preventDefault();
	// console.log(e);
	let username = registerInputUsername.value;
	let password = registerInputPassword.value;
	let password2 = registerInputPassword2.value;

	//see if passwords are matching
	if (matchingPasswords(password, password2) == false)
		return ;

	// send data to backend
	const data = {"username": username, "email": "default", "password": password};
	const registerJSONdata = JSON.stringify(data);
	console.log(data);
	console.log("JSON: " + registerJSONdata);

	fetch('http://127.0.0.1:8000/api/auth/register/', {
		method: 'POST', // Set method here
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		  },
		body: registerJSONdata,
	  })
	  .then(response => response.json())
	  .then(data => console.log(data))
	
	registerModal.style.display = "none";
	console.log("You are successfully registered !");
	})

//LOGIN
signinButton.addEventListener("click", async function (e) {
	console.log("clicked loginButton ! :)");
	let valid = document.querySelector("#login-form").checkValidity();
	if (!valid){
		return ;
	}
	e.preventDefault();
	// console.log(e);
	let username = loginInputUsername.value;
	let password = loginInputPassword.value;
	const data = {username: username, password: password};
	console.log(data);
	const loginJSONdata = JSON.stringify(data);
	console.log(loginJSONdata);

	fetch('http://127.0.0.1:8000/api/auth/login/', {
		method: 'POST', // Set method here
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		  },
		body: loginJSONdata,
	  })
	  .then(response =>  {
		response.json();
		console.log(response.json());
	})
})
	
function inequalPasswordWarning(){
console.log("PASSWORDS DONT MATCH");
let passwordWarning = document.querySelector("#incorrectPasswords");
passwordWarning.style.visibility = "visible";
}
		
function matchingPasswords(p1, p2){
	if (p1.localeCompare(p2) != 0){
		inequalPasswordWarning();
		return false;
		}	
		console.log("Passwords are matching :)");
		return true;
		}


				//URL: /api/auth/register/  Method: POST
				
				// try {
				// 	const response = await fetch("http://127.0.0.1:80/api/auth/register/", {
				// 	  method: "POST",
				// 	  // Set the FormData instance as the request body
				// 	  body: registerJSONdata,
				// 	});
				// 	console.log(await response.json());
				//   } catch (e) {
				// 	console.error(e);
				//   }
