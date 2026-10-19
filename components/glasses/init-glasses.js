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
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjAzODIzMmQ4YWQxMzQ4ZjZiNDdkNzE1NmIxNmQyNTk0IiwiaCI6Im11cm11cjY0In0=';

document.addEventListener('DOMContentLoaded', () => {
    const glassesApp = new GlassesController(ORS_API_KEY);
    glassesApp.init();
});