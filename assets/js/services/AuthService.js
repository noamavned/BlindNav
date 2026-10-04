import CookieManager from './CookieService.js';

class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    checkPassword(password) {
        return this.password === password;
    }
}

const usrLst = [
    new User('admin', 'admin123', 1),
    new User('usr', 'usr123', 0)
];

export default class AuthService {
    async login(username, password) {
        const user = usrLst.find(u => u.username === username);
        const success = Boolean(user && user.checkPassword(password));
        const cookieManager = new CookieManager();
        if (success) {
            cookieManager.setCookie('isLoggedIn', 'true', user.role, 1);
        }
        
        return success ? { success: true, user: user } : { success: false };
    }
} 