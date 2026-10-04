import LoginController from './LoginController.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginApp = new LoginController('loginForm');
    loginApp.init();
});

const togglePasswordButton = document.getElementById('togglePassword');
if (togglePasswordButton) {
    togglePasswordButton.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                togglePasswordButton.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    });
}