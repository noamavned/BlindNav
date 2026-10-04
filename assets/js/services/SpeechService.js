export default class SpeechService {
    speak(text) {
        if (!('speechSynthesis' in window) || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    speakCameraStatus() {
        this.speak('Route camera is active. No critical obstacles in the immediate range.');
    }
}