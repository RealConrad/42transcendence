import {setAccessToken, apiCall, setLocalUsername, setDefaultPicture, fetchDogPicture, setLocalPicture} from "../../api/api.js";
import {BASE_AUTH_API_URL, BASE_MFA_API_URL, EVENT_TYPES, FORM_ERROR_MESSAGES} from "../../utils/constants.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {Router} from '../../Router.js'

class AuthDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	html() {
		return `
			<link rel="stylesheet" href="../../../styles/dialog.css">
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
					<div class="otp" id="otp-view" style="display: none">
						<div class="heading">Enter Verification Code</div>
						<div class="flex-container">
							<div class="group">
								<div class="otp-input-container">
									<input type="text" maxlength="1" class="otp-box" id="otp-1"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-2"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-3"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-4"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-5"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-6"/>
								</div>
								<div class="error-message" id="otp-error"></div>
							</div>
						</div>
						<div class="flex-container margin-top">
							<div class="group">
								<button class="sign-in-button">Verify</button>
							</div>
						</div>
					</div>
					<div class="enable-2fa" id="enable-2fa-view" style="display: none">
						<div class="heading">Enable Two-Factor Authentication</div>
						<div class="flex-container">
							<div class="group">
								<img id="qr-code" alt="QR Code" />
							</div>
						</div>
						<div class="flex-container">
							<div class="group">
								<div class="otp-input-container">
									<input type="text" maxlength="1" class="otp-box" id="otp-1"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-2"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-3"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-4"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-5"/>
									<input type="text" maxlength="1" class="otp-box" id="otp-6"/>
								</div>
								<div class="error-message" id="otp-error"></div>
							</div>
						</div>
						<div class="flex-container margin-top">
							<div class="group">
								<button class="sign-in-button">Verify</button>
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

	render() {
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
		this.attachEventListeners();

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

		this.shadowRoot.getElementById("otp-view").querySelector(".sign-in-button").addEventListener("click", (e) => {
			e.preventDefault();
			this.handleOtpVerification();
		});

		//TODO: Change sign in view and auth button query to enable 2fa button
		this.shadowRoot.getElementById("sign-in-view").querySelector(".auth-button").addEventListener("click", (e) => {
			e.preventDefault();
			// this.enable2FA(); // Here for testing purpose
			this.authorize42();
		});

		this.shadowRoot.getElementById("enable-2fa-view").querySelector(".sign-in-button").addEventListener("click", (e) => {
			e.preventDefault();
			this.handleOtpVerification();
		});

		const optBoxes = this.shadowRoot.querySelectorAll(".otp-box");

		optBoxes.forEach((box, index) => {
			box.addEventListener("input", (e) => {
				const value = e.target.value;
				if (!/^\d$/.test(value)) {
            		e.target.value = ""; // Clear invalid input
        		}
				if (value.length === 1) {
					if (index < optBoxes.length - 1) {
						optBoxes[index + 1].focus();
					}
				} else if (value.length === 0 && index > 0) {
					optBoxes[index - 1].focus();
				}
			});

			// Backspace to go back to previous box
			box.addEventListener("keydown", (e) => {
				if (e.key === "Backspace" && !e.target.value && index > 0) {
					optBoxes[index - 1].focus();
				}
			});
		});
	}

	attachEventListeners() {
		const buttons = this.shadowRoot.querySelectorAll("button");

		buttons.forEach((button) => {
			button.addEventListener("mouseover", () => {
				GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_HOVER, { element: button });
			});

			button.addEventListener("mouseout", () => {
				GlobalEventEmitter.emit(EVENT_TYPES.CURSOR_UNHOVER, { element: button });
			});
		});
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
			localStorage.setItem('authMethod', 'JWT');
			setLocalUsername(username);
			setAccessToken(data.access_token);
			GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
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
			localStorage.setItem('authMethod', 'JWT');
			if (data.mfa_enable_flag) {
    			this.tempAccessToken = data.access_token;
				this.shadowRoot.getElementById("sign-in-view").style.display = "none"
				this.shadowRoot.getElementById("otp-view").style.display = "block";
			} else {
				this.completeLogin(data);
			}
		}).catch(err => console.error(err));
	}

	completeLogin(data) {
		setAccessToken(data.access_token || this.tempAccessToken); // Use the stored token
		setDefaultPicture();
		setLocalUsername(data.username);
		this.tempAccessToken = null; // Clear the temporary token
		GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
		this.close();
	}


	async authorize42()  {
		const response = await fetch(`${BASE_AUTH_API_URL}/authorize/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		})

		const data = await response.json()
		if (response.ok) {
			window.location.href = data.location;

		} else {
			console.error("Some backend error");
		}
	}

	enable2FA() {
		apiCall(`${BASE_MFA_API_URL}/enable/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
			.then((response) => {
				if(!response.ok) {
					throw new Error("Failed to fetch QR code for enabling 2FA");
				}
				return response.blob()
			}) .then((blob) => {
				const qrCodeURL = URL.createObjectURL(blob);
				const qrCodeElement = this.shadowRoot.getElementById("qr-code");
				qrCodeElement.src = qrCodeURL;

				this.shadowRoot.getElementById("sign-in-view").style.display = "none";
				this.shadowRoot.getElementById("enable-2fa-view").style.display = "block";
		}) .catch((error) => {
			console.error("Error enabling 2FA:", error);
		})
	}

	disable2FA() {
		apiCall(`${BASE_MFA_API_URL}/disable/`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
		})
			.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then((err) => {
					console.error("Response not 200");
					throw new Error(JSON.stringify(err));
				})
			}
		})
			.then((data) => {
				console.log("2FA disabled successfully!", data);
				this.close();
			}) .catch((error) => {
				console.error("Failed to disable 2FA");
		})
	}

	verify2FA(otpCode) {
		apiCall(`${BASE_MFA_API_URL}/verify/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				otp_code: otpCode,
			}),
		})
			.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				return response.json().then((err) => {
					console.error("Response not 200");
					throw new Error(JSON.stringify(err));
				})
			}
		})
			.then((data) => {
				console.log("OTP Verified Successfully!", data);
				this.completeLogin(data);
		}) .catch((error) => {
			console.error("Error during OTP Verification:", error);
			this.showError("otp", "Invalid OTP. Please try again.");
		});
	}

	handleOtpVerification() {
		const otpBoxes = this.shadowRoot.querySelectorAll(".otp-box");
		let otpCode = "";
		otpBoxes.forEach((box) => {
			otpCode	+= box.value;
		});

		if (otpCode.length === 6) {
			this.verify2FA(otpCode);
		} else {
			console.error("Invalid OTP: Must be 6 digits");
			const errorMessage = this.shadowRoot.querySelector(".error-message");
			if (errorMessage) {
				errorMessage.textContent = "Invalid OTP. Please enter all 6 digits.";
			}
		}
	}

	connectedCallback() {
		this.render();
		this.attachEventListeners();
	}
}

customElements.define("auth-dialog", AuthDialog);

export async function handleCallback() {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");

		if(code && state) {
			try {
				const response = await fetch(`${BASE_AUTH_API_URL}/callback/`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({code, state})
				});

				if (response.ok) {
					const data = await response.json();
					console.log("OAuth Success:", data);
					setLocalUsername(data.username);
					setLocalPicture(data.profile_picture);
					localStorage.setItem('authMethod', '42OAuth');
					console.log(`Welcome, ${data.username}!`);
					setAccessToken(data.access_token);
					Router.navigateTo("/");
				} else {
					console.error("Error from backed 42 OAuth API");
				}
			} catch (error) {
				console.error("Error during callback handling:", error);
			}
		} else {
			console.log("Authorization code not found in URL");
		}
	}