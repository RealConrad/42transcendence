import {
	setAccessToken, apiCall, setLocalUsername, setDefaultPicture,
	setLocalPicture, setLocal2FA, fetchMatchHistory, fetchFriends, showToast
} from "../../api/api.js";
import {BASE_AUTH_API_URL, BASE_MFA_API_URL, EVENT_TYPES, FORM_ERROR_MESSAGES} from "../../utils/constants.js";
import GlobalEventEmitter from "../../utils/EventEmitter.js";
import {Router} from '../../Router.js'
import GlobalCacheManager from "../../utils/CacheManager.js";

class AuthDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	html() {
		return `
			<style>
				.overlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
				}

				.dialog {
					padding: 20px;
					border-radius: 15px;
					display: flex;
					flex-direction: column;
					align-items: center;
					width: 50%;
					max-width: 600px;
					height: 100%;
					max-height: 560px;
					min-width: 300px;
					min-height: 500px;
					background: var(--background-yellow);
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					text-align: center;
					font-size: 1rem;
					color: #333;
					box-sizing: border-box;
				}

				/*SUPER MESSY I KNOW - ONLY DIFFERENCE IS BIGGER DIMENSIONS -- DONT HAVE TIME TO IMPLEMENT BETTER SOLUTION
				THIS IS USED ON GAME MENU DIALOG
				*/
				.overlay2 {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
				}

				.dialog2 {
					padding: 20px;
					border-radius: 15px;
					display: flex;
					flex-direction: column;
					align-items: center;
					width: 50%;
					max-width: 600px;
					height: 100%;
					max-height: 600px;
					min-width: 400px;
					min-height: 400px;
					background: var(--background-yellow);
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					text-align: center;
					font-size: 1rem;
					color: #333;
					box-sizing: border-box;
				}

				button {
					all: unset;
				}

				.heading {
					font-size: 2rem;
					margin-bottom: 20px;
				}

				.login {
					width: 100%;
					text-align: center;
				}

				.flex-container {
					display: flex;
					justify-content: center;
					margin-bottom: 10px;
				}

				.group {
					width: 100%;
					max-width: 500px;
				}

				.label {
					margin-bottom: 5px;
					font-size: 1.2rem;
					text-align: left;
				}

				.input-field {
					padding: 10px;
					font-size: 1rem;
					width: 100%;
					border: 1px solid #ccc;
					border-radius: 5px;
				}

				input {
					outline: none;
				}

				.sign-in-button {
					width: 100%;
					padding: 10px;
					background-color: black;
					color: white;
					border: none;
					border-radius: 5px;
					font-size: 1.2rem;
				}

				.sign-in-button:hover {
					background-color: #333;
				}

				.account-links {
					margin-top: 10px;
					font-size: 0.9rem;
					color: #333;
					margin-bottom: 30px;
					font-family: monospace;
				}

				.account-links a {
					color: blue;
					text-decoration: none;
				}

				.account-links a:hover {
					text-decoration: underline;
				}

				.margin-top {
					margin-top: 30px;
				}

				.auth-button {
					margin-top: 10px;
					width: 100%;
					padding: 10px;
					background-color: black;
					color: white;
					border: none;
					border-radius: 5px;
					font-size: 1.2rem;
				}

				.auth-button:hover {
					background-color: #333;
				}

				.register {
					text-align: center;
					width: 100%;
				}

				.otp {
					text-align: center;
					width: 100%;
				}

				.error-message {
					color: red;
					font-size: 0.9rem;
					height: 15px; /* Fixed height to reserve space */
					margin-top: 5px;
					text-align: left;
					visibility: hidden; /* Hidden by default, made visible when an error occurs */
				}

				.otp-input-container {
					display: flex;
					justify-content: center;
					gap: 10px;
				}

				.otp-box {
					width: 40px;
					height: 40px;
					text-align: center;
					font-size: 18px;
					border: 1px solid #ccc;
					border-radius: 5px;
				}

				#qr-code {
					width: 200px;
					height: 200px;
					border-radius: 15px;
					border: 2px solid #000;
					margin: 20px auto;
					object-fit: contain;
				}

				.player-input {
					display: flex;
					align-items: center;
					gap: 10px;
					position: relative;
					padding-left: 15px; /* Must Match the remove button's offset */
				}

				#player-inputs {
					padding-left: 20px;
				}

				.player-input input[type="text"] {
					flex: 1;
				}

				.player-input label {
					display: flex;
					align-items: center;
					gap: 5px;
				}

				.player-inputs {
					max-height: 500px;
					width: 500px;
					overflow-y: auto;
				}

				.remove-player-button {
					position: absolute;
					left: -10px;
					background: #ff4d4d;
					border: none;
					color: white;
					padding: 4px 8px;
					border-radius: 50%;
					font-size: 0.5rem;
					line-height: 1;
				}

				.remove-player-button:hover {
					background: #e60000;
				}

				.ai-difficulty {
					margin-top: 10px;
					margin-right: 5px;
				}

				.ai-difficulty label {
					font-size: 0.5rem;
				}

				#ai-difficulty-slider {
					width: 100%;
				}

				.disclaimer {
					font-size: 0.4rem;
					text-align: right;
				}

				.round-heading {
					text-align: left;
					font-weight: bold;
					margin-top: 10px;
				}
				.match-box {
					background-color: #f0f0f0;
					margin: 5px 0;
					padding: 5px;
					border-radius: 5px;
				}
				.match {
					display: flex;
					justify-content: center;
					align-items: center;
					font-family: monospace; /* Monospace font for consistent character widths */
				}
				.player-name {
					width: 110px;
					text-align: center;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				.score {
					width: 40px;
					text-align: center;
				}
				.vs {
					width: 30px;
					text-align: center;
				}
				.winner {
					color: green;
					font-weight: bold;
				}
				.loser {
					color: red;
				}
				.tournament-standings {
					margin-top: 10px;
					max-height: 500px;
					overflow-y: auto;
				}
			</style>
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

	openEnable2fa() {
		this.enable2FA().then((data)=>{
			if (data == 200){
				console.log('enabled 2fa: ', data); 
				this.shadowRoot.getElementById("sign-in-view").style.display = "none";
				this.style.display = "block";
			}
			else if (data == 400){
				console.log('not enabling bc already enabled?')
			}
		})
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
		//this one
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

	async login(username, password) {
		try {
			const response = await fetch(`${BASE_AUTH_API_URL}/login/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify({
					"username": username,
					"password": password
				})
			});

			if (!response.ok) {
				const err = await response.json();
				console.error("Response not 200");
				throw new Error(JSON.stringify(err));
			}

			const data = await response.json();
			localStorage.setItem('authMethod', 'JWT');
			await setDefaultPicture();
			setAccessToken(data.access_token);
			showToast('Successfully logged in!', 'success');
			setLocalUsername(username);

			if (data.displayname) {
				localStorage.setItem('displayName', data.displayname);
			}

			if (data.mfa_enable_flag) {
				this.tempAccessToken = data.access_token;
				this.shadowRoot.getElementById("sign-in-view").style.display = "none";
				this.shadowRoot.getElementById("otp-view").style.display = "block";
			} else {
				this.close();
				await GlobalCacheManager.initialize("matches", fetchMatchHistory);
				await GlobalCacheManager.initialize("friends", fetchFriends);
				await setDefaultPicture();
				GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
			}

		} catch (err) {
			showToast("Unable to login. Make sure credentials are correct or try again later.", 'danger');
			console.error(err);
		}
	}

	async register(username, password) {
		try {
			const response = await fetch(`${BASE_AUTH_API_URL}/register/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify({
					"username": username,
					"password": password
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(JSON.stringify(err));
			}

			const data = await response.json();
			localStorage.setItem('authMethod', 'JWT');
			setLocalUsername(username);
			setAccessToken(data.access_token);
			this.close();
			showToast('Registered successfully', 'success');
			await GlobalCacheManager.initialize("matches", fetchMatchHistory());
			await GlobalCacheManager.initialize("friends", fetchFriends());
			await setDefaultPicture();
			GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
		} catch (err) {
			showToast(err, 'danger');
			console.log(err);
		}
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

	async enable2FA() {
		let response = await apiCall(`${BASE_MFA_API_URL}/enable/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
		})
		if(!response.ok) {
			console.log('response status: ', response.status);
			return response.status;
		}
		let blob = await response.blob();
		const qrCodeURL = URL.createObjectURL(blob);
		const qrCodeElement = this.shadowRoot.getElementById("qr-code");
		qrCodeElement.src = qrCodeURL;

		this.shadowRoot.getElementById("sign-in-view").style.display = "none";
		this.shadowRoot.getElementById("enable-2fa-view").style.display = "block";
		return 200;
	}

	async verify2FA(otpCode) {
		return apiCall(`${BASE_MFA_API_URL}/verify/`, {
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
				this.close();
				return true;
		}) .catch((error) => {
			console.error("Error during OTP Verification:", error);
			this.showError("otp", "Invalid OTP. Please try again.");
			return false;
		});
	}

	handleOtpVerification() {
		const otpBoxes = this.shadowRoot.querySelectorAll(".otp-box");
		let otpCode = "";
		otpBoxes.forEach((box) => {
			otpCode	+= box.value;
		});

		if (otpCode.length === 6) {
			this.verify2FA(otpCode).then((val)=>{
				console.log('verification status: ', val);
				if (val){
					// GlobalEventEmitter.emit(EVENT_TYPES.SET_TWOFACTOR, {})
					setLocal2FA(true);
					GlobalEventEmitter.emit(EVENT_TYPES.RELOAD_DASHBOARD, {});
				}
			})
		}
		else {
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
					Router.navigateTo("/");
					console.error("Error from backed 42 OAuth API");
				}
			} catch (error) {
				Router.navigateTo("/");
				console.error("Error during callback handling:", error);
			}
		} else {
			console.log("Authorization code not found in URL");
		}
	}