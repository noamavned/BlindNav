# 👁️ BlindNav

**Navigate the World with Confidence**

BlindNav bridges the gap between spatial awareness and remote caregiver support, offering a comprehensive navigation ecosystem for the visually impaired.

This project integrates a wearable hardware embedded system with a web-based companion application to provide real-time routing, obstacle detection, and caregiver monitoring.

## 🎓 Academic Context

This project is developed as a final Practical Engineering (הנדסאי אלקטרוניקה ומחשבים) project at **Kinneret Technological College** (המכללה הטכנולוגית כנרת).

* **Authors:** Noam Abend & Richard Titenko
* **Advisor:** Aviel Hariv
* **Year:** 2027 (תשפ"ז)

## ✨ Key Features

* **Real-Time Navigation:** Utilizes the OpenRouteService (ORS) API and OpenStreetMap (OSM) to calculate pedestrian routes, with up to 3 alternative options to choose from.
* **Spatial Awareness & Obstacle Detection:** Hardware sensors (ultrasonic) provide immediate feedback about the user's physical surroundings to prevent collisions.
* **Remote Caregiver Support:** A web portal connected to Firebase, allowing caregivers to monitor the user's live location and send audio pings.
* **Audio Feedback (Bone Conduction):** Delivers TTS (Text-to-Speech) navigation instructions and proximity alerts via bone conduction, leaving the user's ear canal completely open to ambient environmental sounds.
* **Hands-Free Operation:** A wearable system integrated with an array of 5 pushbuttons for tactile, screen-free control.

## 🏗️ System Architecture

The system operates on parallel processing tracks to ensure immediate safety without compromising complex navigation calculations:

1. **Main Processing & Sensors (Altera DE10-LITE FPGA):**
   * Acts as the core real-time processing unit.
   * Directly interfaces with the **HC-SR04** ultrasonic sensor for zero-latency obstacle detection.
   * Manages user inputs via a **5-pushbutton array**.
   * Generates digital I2S audio signals sent to the **MAX98357A PCM Amplifier**, which drives the **Bone Conduction Speaker**.

2. **Communication & Routing (ESP32 DevKit V1):**
   * Serves as the system's communication bridge (Wi-Fi).
   * Communicates directly with the FPGA via **UART** (TX/RX).
   * Connects to **Firebase** for state management and web app synchronization.
   * Handles location logic, Haversine distance calculations, and fetches routing data.
   * Controls a visual status indicator (Green 3mm LED).

3. **Visual Processing (ESP32-CAM):**
   * Operates independently, connecting via Wi-Fi to a dedicated camera server for advanced visual data capture.

## 🛠️ Software Stack

* **Frontend Web App:** HTML5, Vanilla JavaScript (ES6 classes and modules), CSS3.
* **UI Framework:** Bootstrap 5 (responsive layouts and accessible UI components).
* **Maps:** Leaflet with OpenStreetMap tiles; Nominatim for geocoding and reverse geocoding.
* **Cloud & Database:** Firebase Realtime Database (loaded as ES modules from the Firebase CDN, no bundler needed).
* **Routing:** OpenRouteService (ORS) API, `foot-walking` profile.
* **Voice:** Browser Web Speech API (`speechSynthesis`) for TTS.
* **Session Handling:** Custom `CookieManager` storing `isLoggedIn`, `role` and `device_id`.
* **Hardware Languages:** VHDL (for FPGA logic), C/C++ (for ESP32 microcontrollers).

## 📁 Web App Structure

```
index.html                     Landing page
assets/
  css/                         global.css, index.css
  js/services/
    AuthService.js             Login check against Firebase
    CookieService.js           Cookie helper (CookieManager)
    FirebaseService.js         Firebase config + all database access
    MapApiService.js           Nominatim + OpenRouteService calls
    SpeechService.js           Text-to-speech wrapper
components/
  login/                       Sign-in page
  glasses/                     Main dashboard (user / glasses side)
  inspector/                   Remote dashboard (caregiver side)
```

Users are routed after login by their `role`: `0` opens the caregiver (inspector) dashboard, `1` opens the glasses dashboard.

### Firebase data layout

```
users/<username>   { password, role, device_id }
devices/<device_id>/
  navigation       { startLat, startLng, targetLat, targetLng, currentInstruction, routeStatus }
  sensors          { distance, ping }
  telemetry        { lastSync }
```

## 🚀 Getting Started

### Prerequisites

* A modern web browser.
* An [OpenRouteService API key](https://openrouteservice.org/).
* A Firebase project with a Realtime Database.
* A local development server (such as VS Code Live Server). ES modules do not work when opening files via `file://`.

### Web Application Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/noamavened/BlindNav.git
   cd BlindNav
   ```

2. **Add your own API keys.**
   All API keys and credentials have been removed from this repository. The app will not work until you fill in your own values in these two places:

   * **Firebase config:** in `assets/js/services/FirebaseService.js`, replace the placeholders in the `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_FIREBASE_API_KEY",
         authDomain: "YOUR_PROJECT.firebaseapp.com",
         databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_PROJECT.firebasestorage.app",
         messagingSenderId: "YOUR_SENDER_ID",
         appId: "YOUR_APP_ID",
         measurementId: "YOUR_MEASUREMENT_ID"
     };
     ```
   * **OpenRouteService key:** in `components/glasses/init-glasses.js`:
     ```javascript
     const ORS_API_KEY = 'YOUR_ORS_API_KEY';
     ```

   > Never commit real keys. Keep your edited copies local, or move them into a `config.js` that is listed in `.gitignore` and import it from these files.

3. **Create the initial data in Firebase.**
   Add at least one user per role under `users/` and a matching device entry (see the data layout above), for example:
   ```json
   {
     "users": {
       "user":  { "password": "...", "role": 1, "device_id": "BN_001" },
       "admin": { "password": "...", "role": 0, "device_id": "BN_001" }
     },
     "devices": {
       "BN_001": {
         "navigation": {
           "startLat": 0, "startLng": 0, "targetLat": 0, "targetLng": 0,
           "currentInstruction": "Waiting for destination...",
           "routeStatus": "idle"
         },
         "sensors": { "distance": 50, "ping": false },
         "telemetry": { "lastSync": 0 }
       }
     }
   }
   ```
   Both accounts share the same `device_id` so the caregiver sees the glasses user's data.

4. **Run the application:**
   Start your local dev server and open `index.html`.

## 🔒 Security Notes

* **API keys were removed from the repository.** If real keys were ever committed, they remain in the git history. Revoke and regenerate them (ORS dashboard and Firebase console) rather than relying on the deletion alone.
* Firebase web config values are not secret by themselves, but access must be restricted with **Firebase Realtime Database security rules** and, where possible, API key restrictions (allowed domains) in the Google Cloud console.
* This project is a college prototype. Session state is kept in client-side cookies set from JavaScript, so they cannot be `HttpOnly`, and user passwords are currently compared in plain text against the database. Before any real-world deployment, move authentication to Firebase Authentication (or a backend) and store no plain-text passwords.
