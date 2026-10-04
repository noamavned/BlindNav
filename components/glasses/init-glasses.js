import GlassesController from './GlassesController.js';
import CookieManager from '../../assets/js/services/CookieService.js';

const cookieManager = new CookieManager();
const isLoggedIn = cookieManager.getCookie('isLoggedIn') === 'true';
const userRole = cookieManager.getCookie('isLoggedIn_role');
console.log('isLoggedIn:', isLoggedIn);
console.log('userRole:', userRole);
if (!isLoggedIn || userRole !== '1') {
    window.location.href = '../../index.html';
}

const ORS_API_KEY = 'API_KEY_PLACEHOLDER';

document.addEventListener('DOMContentLoaded', () => {
    const glassesApp = new GlassesController(ORS_API_KEY);
    glassesApp.init();

});