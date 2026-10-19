import GlassesController from './GlassesController.js';
import FirebaseService from '../../assets/js/services/FirebaseService.js';

const firebaseService = new FirebaseService();

firebaseService.updateNavigationState({
    targetLat: 0,
    targetLng: 0,
    currentInstruction: "Waiting for destination...",
    routeStatus: "idle"
});
firebaseService.updateSync();
const ORS_API_KEY = 'api';

document.addEventListener('DOMContentLoaded', () => {
    const glassesApp = new GlassesController(ORS_API_KEY);
    glassesApp.init();
});
