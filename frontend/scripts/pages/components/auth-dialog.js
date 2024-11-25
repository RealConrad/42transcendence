import {setAccessToken} from "../../api/api.js";
import {BASE_AUTH_API_URL, FORM_ERROR_MESSAGES} from "../../utils/constants.js";


class AuthDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	html() {
		return `
			<link rel="stylesheet" href="../../../styles/auth-dialog.css">
			<div class="overlay" id="overlay">
				<div class="dialog">
					<div class="login" id="sign-in-view">
						<div class="heading">SIGN IN</div>
						<div class="flex-container">
							<div class="group">
								<div class="label">Username</div>
								<input type="text" placeholder="Username" class="input-field" id="signin-username" />
								<div class="error-message" id="signin-username-error"></div>
							</div>
						</div>
						<div class="flex-container">
							<div class="group">
								<div class="label">Password</div>
								<input type="password" placeholder="Password" class="input-field" id="signin-password" />
								<div class="error-message" id="signin-password-error"></div>
							</div>
						</div>
						<div class="flex-container margin-top">
							<div class="group">
								<button class="sign-in-button">Sign In</button>
								<div class="account-links">
									Don't have an account yet?
									<a href="#" id="toggle-register">Create an account.</a>
									<br />
									Or directly login with your 42 Account below.
								</div>
								<button class="auth-button">42 Authentication</button>
							</div>
						</div>
					</div>
					<div class="register" id="register-view" style="display: none;">
						<div class="heading">SIGN UP</div>
						<div class="flex-container">
							<div class="group">
								<div class="label">Username</div>
								<input type="text" placeholder="Username" class="input-field" id="register-username" />
								<div class="error-message" id="register-username-error"></div>
							</div>
						</div>
						<div class="flex-container">
							<div class="group">
								<div class="label">Password</div>
								<input type="password" placeholder="Password" class="input-field" id="register-password" />
								<div class="error-message" id="register-password-error"></div>
							</div>
						</div>
						<div class="flex-container">
							<div class="group">
								<div class="label">Confirm password</div>
								<input type="password" placeholder="Password" class="input-field" id="register-confirm-password" />
								<div class="error-message" id="register-confirm-password-error"></div>
							</div>
						</div>
						<div class="flex-container margin-top">
							<div class="group">
								<button class="sign-in-button">Register</button>
								<div class="account-links">
									Already have an account?
									<a href="#" id="toggle-signin">Sign In.</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	open() {
		this.style.display = "block";
	}

	close() {
		this.style.display = "none";
	}

	isValidInput(input) {
		const invalidChars = /['";\-]/;
		return !invalidChars.test(input.trim());
	}

	showError(inputId, errorMessage) {
		const errorDiv = this.shadowRoot.getElementById(`${inputId}-error`);
		if (errorDiv) {
			errorDiv.textContent = errorMessage;
			errorDiv.style.visibility = "visible";
		}
	}

	hideError(inputId) {
		const errorDiv = this.shadowRoot.getElementById(`${inputId}-error`);
		if (errorDiv) {
			errorDiv.textContent = "";
			errorDiv.style.visibility = "hidden";
		}
	}

	async render() {
		this.shadowRoot.innerHTML = this.html();

		this.shadowRoot.getElementById("toggle-register").addEventListener("click", (e) => {
			e.preventDefault();
			this.shadowRoot.getElementById("sign-in-view").style.display = "none";
			this.shadowRoot.getElementById("register-view").style.display = "block";
		});

		this.shadowRoot.getElementById("toggle-signin").addEventListener("click", (e) => {
			e.preventDefault();
			this.shadowRoot.getElementById("register-view").style.display = "none";
			this.shadowRoot.getElementById("sign-in-view").style.display = "block";
		});

		this.shadowRoot.getElementById("overlay").addEventListener("click", (e) => {
			if (e.target.id === "overlay") {
				this.close();
			}
		});

		this.shadowRoot.querySelector("#sign-in-view .sign-in-button").addEventListener("click", (e) => {
			e.preventDefault();
			const username = this.shadowRoot.getElementById("signin-username").value.trim();
			const password = this.shadowRoot.getElementById("signin-password").value.trim();
			let isValid = true;

			if (!username) {
				this.showError("signin-username", FORM_ERROR_MESSAGES.usernameRequired);
				isValid = false;
			} else if (!this.isValidInput(username)) {
				this.showError("signin-username", FORM_ERROR_MESSAGES.invalidUsername);
				isValid = false;
			} else {
				this.hideError("signin-username");
			}

			if (!password) {
				this.showError("signin-password", FORM_ERROR_MESSAGES.passwordRequired);
				isValid = false;
			} else if (!this.isValidInput(password)) {
				this.showError("signin-password", FORM_ERROR_MESSAGES.invalidPassword);
				isValid = false;
			} else {
				this.hideError("signin-password");
			}

			if (isValid) {
				this.login(username, password);
			}
		});

		this.shadowRoot.querySelector("#register-view .sign-in-button").addEventListener("click", (e) => {
			e.preventDefault();
			const username = this.shadowRoot.getElementById("register-username").value.trim();
			const password = this.shadowRoot.getElementById("register-password").value.trim();
			const confirmPassword = this.shadowRoot.getElementById("register-confirm-password").value.trim();
			let isValid = true;

			if (!username) {
				this.showError("register-username", FORM_ERROR_MESSAGES.usernameRequired);
				isValid = false;
			} else if (!this.isValidInput(username)) {
				this.showError("register-username", FORM_ERROR_MESSAGES.invalidUsername);
				isValid = false;
			} else {
				this.hideError("register-username");
			}

			if (!password) {
				this.showError("register-password", FORM_ERROR_MESSAGES.passwordRequired);
				isValid = false;
			} else if (!this.isValidInput(password)) {
				this.showError("register-password", FORM_ERROR_MESSAGES.invalidPassword);
				isValid = false;
			} else {
				this.hideError("register-password");
			}

			if (password !== confirmPassword) {
				this.showError("register-confirm-password", FORM_ERROR_MESSAGES.passwordsDoNotMatch);
				isValid = false;
			} else {
				this.hideError("register-confirm-password");
			}

			if (isValid) {
				this.register(username, password);
			}
		});
	}

	attatchEventListeners() {

	}

	register(username, password) {
		fetch(`${BASE_AUTH_API_URL}/register/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include",
			body: JSON.stringify({
				"username": username,
				"password": password
			})
		}).then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then((err) => {
					throw new Error(JSON.stringify(err));
				})
			}
		}).then((data) => {
			console.log(data);
			setAccessToken(data.access_token);
			this.close();
		}).catch(err => console.log(err));
	}

	login(username, password) {
		fetch(`${BASE_AUTH_API_URL}/login/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			credentials: "include",
			body: JSON.stringify({
				"username": username,
				"password": password
			})
		}).then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then((err) => {
					console.error("Response not 200");
					throw new Error(JSON.stringify(err));
				})
			}
		}).then((data) => {
			console.log("LOGGED IN!");
			setAccessToken(data.access_token);
			this.close();
		}).catch(err => console.error(err));
	}

	connectedCallback() {
		this.render();
		this.attatchEventListeners()
	}
}

customElements.define("auth-dialog", AuthDialog);
