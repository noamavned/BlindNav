import CookieManager from './CookieService.js';
import FirebaseService from './FirebaseService.js';

const firebaseService = new FirebaseService();

export default class AuthService {
    async login(username, password) {
        const user = await firebaseService.getUser(username);
        const success = Boolean(user && user.password === password);
        if (success) {
            const cookieManager = new CookieManager();
            cookieManager.setCookie('isLoggedIn', 'true');
            cookieManager.setCookie('role', user.role);
            cookieManager.setCookie('device_id', user.device_id); 
            firebaseService.updateSync();
            return { success: true, user: user };
        }
        return { success: false };
    }
}