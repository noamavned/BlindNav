import AuthService from '../../assets/js/services/AuthService.js'; 

const ROUTES_BY_ROLE = {
    0: '../inspector/inspect.html',
    1: '../glasses/glasses.html'
};

export default class LoginController {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.errorMsg = document.getElementById('loginError');
        
        this.authService = new AuthService();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this._handleSubmit(e));
        }
    }

    async _handleSubmit(e) {
        e.preventDefault();
        this._clearError();

        const result = await this.authService.login(this.usernameInput.value, this.passwordInput.value);

        if (!result.success) {
            this._showError('Incorrect username or password.');
            return;
        }

        const destination = ROUTES_BY_ROLE[result.user.role];
        if (!destination) {
            this._showError("No page is configured for this account's role.");
            return;
        }

        window.location.href = destination;
    }

    _showError(message) {
        if (this.errorMsg) {
            this.errorMsg.textContent = message;
            this.errorMsg.classList.remove('d-none');
        }
    }

    _clearError() {
        if (this.errorMsg) {
            this.errorMsg.textContent = '';
            this.errorMsg.classList.add('d-none');
        }
    }
}
