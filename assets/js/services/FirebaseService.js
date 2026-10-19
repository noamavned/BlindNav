import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import cookieManager from './CookieService.js';


const cookies = new cookieManager();

export default class FirebaseService {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyB-Wl8u_M3w7v9oGN8DlLJ-suSOmNy83U0",
            authDomain: "blindnav-01.firebaseapp.com",
            databaseURL: "https://blindnav-01-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "blindnav-01",
            storageBucket: "blindnav-01.firebasestorage.app",
            messagingSenderId: "759919173369",
            appId: "1:759919173369:web:47308c0a8ee8e371cfcc28",
            measurementId: "G-ED3YRKY6VQ"
        };

        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.username = null;
    }

//     async setUpDevice(deviceId, threshold = 50) {
//     const deviceRef = ref(this.db, `devices/${deviceId}`);
//     return set(deviceRef, {
//         navigation: {
//             startLat: 0,
//             startLng: 0,
//             targetLat: 0,
//             targetLng: 0,
//             currentInstruction: "Waiting for destination...",
//             routeStatus: "idle"
//         },
//         sensors: {
//             distance: threshold,
//             ping: false
        
//         },
//         telemetry: { lastSync: Date.now() }
//     });
// }

//     async setUpUser(username, password, role, deviceId) {
//         const userRef = ref(this.db, `users/${username}`);
//         return set(userRef, { password, role, device_id: deviceId });
//     }

    async updateSync() {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) throw new Error("Device ID not found in cookies.");
        const syncRef = ref(this.db, `devices/${deviceId}/telemetry`);
        return update(syncRef, {'lastSync': Date.now()});
    }

    async getUser(username) {
        const userRef = ref(this.db, `users/${username}`);
        const snapshot = await get(userRef);
        this.updateSync();
        return snapshot.exists() ? snapshot.val() : null;
    }

    async getDistance() {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) {
            console.error("No device_id found in cookies.");
            return null;
        }
        const thresholdRef = ref(this.db, `devices/${deviceId}/sensors/distance`);
        const snapshot = await get(thresholdRef);

        this.updateSync();
        return snapshot.exists() ? snapshot.val() : null;
    }

    async updateNavigationState(navData) {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) throw new Error("Device ID not found in cookies.");
        const navRef = ref(this.db, `devices/${deviceId}/navigation`)

        this.updateSync();
        return update(navRef, navData);
    }

    async sendPing() {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) throw new Error("Device ID not found in cookies.");
        const sensRef = ref(this.db, `devices/${deviceId}/sensors`)

        this.updateSync();
        return update(sensRef, {ping: true});
    }

    async getCurrentLocation() {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) throw new Error("Device ID not found in cookies.");

        const snapshot = await get(ref(this.db, `devices/${deviceId}/navigation`));
        if (!snapshot.exists()) return null;

        const { startLat, startLng } = snapshot.val();
        if (startLat === undefined || startLng === undefined) return null;

        return { lat: startLat, lng: startLng };
    }

    subscribeToLocation(onData, onError) {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) throw new Error("Device ID not found in cookies.");

        const navRef = ref(this.db, `devices/${deviceId}/navigation`);
        return onValue(navRef, (snapshot) => {
            const nav = snapshot.exists() ? snapshot.val() : null;
            const lat = nav?.startLat;
            const lng = nav?.startLng;

            if (!lat && !lng) return onData(null);
            onData({ lat, lng });
        }, onError);
    }
    
    async updateLocation(lat, lng) {
        const deviceId = cookies.getCookie('device_id');
        if (!deviceId) return;

        const navRef = ref(this.db, `devices/${deviceId}/navigation`);
        return update(navRef, {
            startLat: lat,
            startLng: lng,
        });
    }
}