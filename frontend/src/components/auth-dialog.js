class AuthDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async html() {
		await Promise.resolve();
		return `
			<link rel="stylesheet" href="../../styles/auth-dialog.css">
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
		this.shadowRoot.innerHTML = await this.html();

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
				this.showError("signin-username", "Username is required.");
				isValid = false;
			} else if (!this.isValidInput(username)) {
				this.showError("signin-username", "Invalid characters in username.");
				isValid = false;
			} else {
				this.hideError("signin-username");
			}

			if (!password) {
				this.showError("signin-password", "Password is required.");
				isValid = false;
			} else if (!this.isValidInput(password)) {
				this.showError("signin-password", "Invalid characters in password.");
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
				this.showError("register-username", "Username is required.");
				isValid = false;
			} else if (!this.isValidInput(username)) {
				this.showError("register-username", "Invalid characters in username.");
				isValid = false;
			} else {
				this.hideError("register-username");
			}

			if (!password) {
				this.showError("register-password", "Password is required.");
				isValid = false;
			} else if (!this.isValidInput(password)) {
				this.showError("register-password", "Invalid characters in password.");
				isValid = false;
			} else {
				this.hideError("register-password");
			}

			if (password !== confirmPassword) {
				this.showError("register-confirm-password", "Passwords do not match.");
				isValid = false;
			} else {
				this.hideError("register-confirm-password");
			}

			if (isValid) {
				alert("Registration successful");
			}
		});
	}

	login(username, password) {
		fetch("http://127.0.0.1:8000/api/auth/login/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"username": username,
				"email": "conrad6@example.com",
				"password": password
			})
		}).then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				console.error(response);
				throw new Error("Something wrong with api");
			}
		}).then((data) => {
			console.log(data);
		}).catch(err => console.log(err));
	}

	connectedCallback() {
		this.render();
	}
}

customElements.define("auth-dialog", AuthDialog);
