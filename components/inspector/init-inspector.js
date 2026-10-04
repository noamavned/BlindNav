import InspectorController from './InspectorController.js';
import CookieManager from '../../assets/js/services/CookieService.js';

const cookieManager = new CookieManager();
const isLoggedIn = cookieManager.getCookie('isLoggedIn') === 'true';
const userRole = cookieManager.getCookie('isLoggedIn_role');
console.log('isLoggedIn:', isLoggedIn);
console.log('userRole:', userRole);
if (!isLoggedIn || userRole !== '0') {
    window.location.href = '../../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const inspectorApp = new InspectorController();
    inspectorApp.init();
});