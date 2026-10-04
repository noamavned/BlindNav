export default class InspectorController {
    constructor() {
        // State
        this.map = null;
        this.userMarker = null;
        this.trackingInterval = null;

        // DOM Elements
        this.mapTab = document.getElementById("map-tab");
        this.logContainer = document.getElementById("logContainer");
        this.btnAudioPing = document.getElementById("btnAudioPing");
        this.statusText = document.getElementById("statusText");
        this.pulseIndicator = document.getElementById("pulseIndicator");
    }

    init() {
        this.initMap();
        this.bindEvents();

        this.addLog("System initialized. Awaiting GPS coordinates.", "info");
        this.addLog("Camera stream successfully connected.", "success");

        this.fetchLiveLocation();
        this.trackingInterval = setInterval(() => this.fetchLiveLocation(), 3000);
    }

    initMap() {
        this.map = L.map("trackingMap").setView([0, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(this.map);
    }

    bindEvents() {
        if (this.mapTab) {
            this.mapTab.addEventListener("shown.bs.tab", () => {
                this.map.invalidateSize();
            });
        }

        if (this.btnAudioPing) {
            this.btnAudioPing.addEventListener("click", () => this.sendAudioPing());
        }
    }

    addLog(message, type = "info") {
        if (!this.logContainer) return;
        
        const time = new Date().toLocaleTimeString();
        let badgeClass = "bg-primary";
        
        if (type === "warning") badgeClass = "bg-warning text-dark";
        if (type === "danger") badgeClass = "bg-danger";
        if (type === "success") badgeClass = "bg-success";

        const logHtml = `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${message}</div>
                    <small class="text-muted">Recorded at: ${time}</small>
                </div>
                <span class="badge ${badgeClass} rounded-pill">${type.toUpperCase()}</span>
            </div>
        `;
        this.logContainer.insertAdjacentHTML("afterbegin", logHtml); 
    }

    sendAudioPing() {
        if (!this.btnAudioPing) return;

        this.btnAudioPing.innerHTML = "⏳ Sending...";
        this.btnAudioPing.classList.replace("btn-warning", "btn-secondary");

        setTimeout(() => {
            this.btnAudioPing.innerHTML = "✅ Ping Sent!";
            this.btnAudioPing.classList.replace("btn-secondary", "btn-success");
            this.addLog("Caregiver sent an Audio Ping to user.", "info");

            setTimeout(() => {
                this.btnAudioPing.innerHTML = "🔊 Send Audio Ping";
                this.btnAudioPing.classList.replace("btn-success", "btn-warning");
            }, 2000);
        }, 800);
    }

    fetchLiveLocation() {
        try {
            const time = Date.now() / 10000;
            const lat = 32.794 + Math.sin(time) * 0.001;
            const lng = 35.5331 + Math.cos(time) * 0.001;

            this.updateMapMarker(lat, lng);
            if (this.statusText) this.statusText.innerText = "Live Tracking Active";
            if (this.pulseIndicator) this.pulseIndicator.style.backgroundColor = "#198754";
        } catch (error) {
            console.error("Error fetching location data:", error);
            if (this.statusText) this.statusText.innerText = "Connection Lost";
            if (this.pulseIndicator) this.pulseIndicator.style.backgroundColor = "#dc3545";
            this.addLog("Lost connection to glasses GPS.", "danger");
        }
    }

    updateMapMarker(lat, lng) {
        const newLatLng = new L.LatLng(lat, lng);

        if (!this.userMarker) {
            this.userMarker = L.marker(newLatLng).addTo(this.map);
            this.map.setView(newLatLng, 17);
            this.addLog(`First location lock achieved: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "success");
        } else {
            this.userMarker.setLatLng(newLatLng);
        }
    }
}