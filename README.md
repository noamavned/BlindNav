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

* **Real-Time Navigation:** Utilizes the OpenRouteService (ORS) API and OpenStreetMap (OSM) to calculate and deliver accessible pedestrian routes.
* **Spatial Awareness & Obstacle Detection:** Hardware sensors (ultrasonic) provide immediate feedback about the user's physical surroundings to prevent collisions.
* **Remote Caregiver Support:** A secure web portal connected to Firebase, allowing caregivers to monitor location and assist with navigation.
* **Audio Feedback (Bone Conduction):** Delivers TTS (Text-to-Speech) navigation instructions and proximity alerts via bone conduction, leaving the user's ear canal completely open to ambient environmental sounds.
* **Hands-Free Operation:** A wearable system integrated with an array of 5 pushbuttons for tactile, screen-free control.

## 🏗️ System Architecture

The system operates on two parallel processing tracks to ensure immediate safety without compromising complex navigation calculations:

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

* **Frontend Web App:** HTML5, Vanilla JavaScript (ES6 Classes), CSS3.
* **UI Framework:** Bootstrap 5 (for responsive layouts and accessible UI components).
* **Cloud & Database:** Firebase Realtime Database / Firestore.
* **Mapping & Routing:** OpenRouteService (ORS) API.
* **State Management:** Custom `CookieManager` for secure, role-based session handling.
* **Hardware Languages:** VHDL (for FPGA logic), C/C++ (for ESP32 microcontrollers).

## 🚀 Getting Started

### Prerequisites

* A modern web browser.
* An active [OpenRouteService API Key](https://openrouteservice.org/).
* Firebase project credentials.
* A local development server (like VS Code Live Server) or a bundler like Vite.

### Web Application Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blindnav.git
   cd blindnav
   ```

2. **Configure Environment Variables:**
   Depending on your build setup, you need to provide your OpenRouteService API key and Firebase config.

   *If using Vite/Bundler:* Create a `.env` file in the root directory:
   ```env
   VITE_ORS_API_KEY=your_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_key
   ```

   *If using Vanilla JS without a bundler:* Create a `config.js` file (ensure this is added to `.gitignore`):
   ```javascript
   export const ORS_API_KEY = 'your_api_key_here';
   // Add Firebase config object here
   ```

3. **Run the Application:**
   Start your local dev server and open `index.html`.

## 🔒 Security Note

This project uses custom cookie management for session handling. When deploying to a production environment, ensure that cookies are set with `Secure` and `HttpOnly` flags where appropriate, and never expose your raw API keys in public client-side repositories.
