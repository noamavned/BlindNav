import SpeechService from '../../assets/js/services/SpeechService.js';
import MapApiService from '../../assets/js/services/MapApiService.js';

class MarkerFactory {
    static icon(color) {
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });
    }
}

class AutocompleteField {
    constructor(inputId, suggestionsId, mapApiService, onSelect) {
        this.input = document.getElementById(inputId);
        this.suggestions = document.getElementById(suggestionsId);
        this.mapApiService = mapApiService;
        this.onSelect = onSelect;
        this.debounceTimer = null;
        if (this.input) this._bind();
    }

    _bind() {
        this.input.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            const query = this.input.value.trim();
            if (query.length < 3) return this._hide();
            this.debounceTimer = setTimeout(() => this._fetchAndRender(query), 400);
        });
        document.addEventListener('click', (e) => {
            if (e.target !== this.input && e.target.parentNode !== this.suggestions) this._hide();
        });
    }

    async _fetchAndRender(query) {
        const results = await this.mapApiService.searchAddress(query);
        this.suggestions.innerHTML = '';
        if (!results || results.length === 0) return this._hide();

        results.forEach((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'list-group-item list-group-item-action';
            btn.innerText = item.display_name;
            btn.onclick = () => {
                this.input.value = item.display_name;
                this._hide();
                this.onSelect({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
            };
            this.suggestions.appendChild(btn);
        });
        this.suggestions.style.display = 'block';
    }

    _hide() { this.suggestions.style.display = 'none'; }
}

class RadarDisplay {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.angle = 0;
    }

    start() {
        if (!this.canvas || !this.ctx) return;
        this._tick();
    }

    _tick() {
        this._draw();
        this.angle += 0.03;
        requestAnimationFrame(() => this._tick());
    }

    _draw() {
        const { ctx, canvas } = this;
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const maxRadius = canvas.width / 2 - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        for (let r = 35; r <= maxRadius; r += 35) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, Math.PI, 0);
            ctx.stroke();
        }

        for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(a) * maxRadius, centerY + Math.sin(a) * maxRadius);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const sweepAngle = Math.PI + (Math.sin(this.angle) + 1) * (Math.PI / 2);
        ctx.lineTo(centerX + Math.cos(sweepAngle) * maxRadius, centerY + Math.sin(sweepAngle) * maxRadius);
        ctx.stroke();
    }
}

export default class GlassesController {
    constructor(apiKey) {
        this.speech = new SpeechService();
        this.mapApi = new MapApiService(apiKey);
        this.radar = new RadarDisplay('radarCanvas');

        this.map = null;
        this.startMarker = null;
        this.endMarker = null;
        this.selectMode = null;
        this.alternativeRoutes = [];
        this.allRoutesGroup = null;
        this.currentRouteText = '';
    }

    init() {
        this._initMap();
        this.locateUser();
        this.radar.start();
        this._bindEvents();

        new AutocompleteField('startLocation', 'startSuggestions', this.mapApi, (coords) => this._placeMarker('start', coords));
        new AutocompleteField('endLocation', 'endSuggestions', this.mapApi, (coords) => this._placeMarker('end', coords));
    }

    _bindEvents() {
        document.getElementById('btnAnnounceStatus').addEventListener('click', () => this.speech.speakCameraStatus());
        document.getElementById('btnLocateUser').addEventListener('click', () => this.locateUser());
        document.getElementById('btnSelectStart').addEventListener('click', () => this.setSelectMode('start'));
        document.getElementById('btnSelectEnd').addEventListener('click', () => this.setSelectMode('end'));
        document.getElementById('btnCalculateRoute').addEventListener('click', () => this.calculateRoute());

        // Event delegation for dynamically created buttons
        document.getElementById('navStatus').addEventListener('click', (e) => {
            const btn = e.target.closest('.route-select-btn');
            if (btn) this.selectRoute(parseInt(btn.dataset.index));
        });

        document.getElementById('routeSteps').addEventListener('click', (e) => {
            if (e.target.closest('#btnReadRoute')) this.speech.speak(this.currentRouteText);
        });
    }

    _initMap() {
        this.map = L.map('osmMap').setView([31.9613, 34.8056], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        this.map.on('click', (e) => this._handleMapClick(e));
    }

    async _handleMapClick(e) {
        if (!this.selectMode) return;
        const { lat, lng } = e.latlng;
        const address = await this.mapApi.reverseGeocode(lat, lng);
        document.getElementById(this.selectMode === 'start' ? 'startLocation' : 'endLocation').value = address;

        this._placeMarker(this.selectMode, { lat, lon: lng });
        document.getElementById(`btnSelect${this.selectMode === 'start' ? 'Start' : 'End'}`).classList.remove('active');
        document.getElementById('mapInstruction').classList.add('d-none');
        this.selectMode = null;
    }

    _placeMarker(type, { lat, lon }) {
        if (type === 'start') {
            if (this.startMarker) this.map.removeLayer(this.startMarker);
            this.startMarker = L.marker([lat, lon], { icon: MarkerFactory.icon('blue') }).addTo(this.map).bindPopup('Starting Point').openPopup();
        } else {
            if (this.endMarker) this.map.removeLayer(this.endMarker);
            this.endMarker = L.marker([lat, lon], { icon: MarkerFactory.icon('red') }).addTo(this.map).bindPopup('Destination').openPopup();
        }
        if (this.startMarker && this.endMarker) this.map.fitBounds(new L.featureGroup([this.startMarker, this.endMarker]).getBounds(), { padding: [30, 30] });
    }

    locateUser() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude: lat, longitude: lon } = position.coords;
            this.map.setView([lat, lon], 16);
            if (this.startMarker) this.map.removeLayer(this.startMarker);
            this.startMarker = L.marker([lat, lon], { icon: MarkerFactory.icon('blue') }).addTo(this.map).bindPopup('Your Location').openPopup();
            document.getElementById('startLocation').value = await this.mapApi.reverseGeocode(lat, lon);
        });
    }

    setSelectMode(mode) {
        this.selectMode = mode;
        const instruction = document.getElementById('mapInstruction');
        instruction.classList.remove('d-none');
        document.getElementById('btnSelectStart').classList.remove('active');
        document.getElementById('btnSelectEnd').classList.remove('active');
        
        if (mode === 'start') {
            instruction.innerHTML = '<strong>Click on the map</strong> to set the starting point';
            document.getElementById('btnSelectStart').classList.add('active');
        } else {
            instruction.innerHTML = '<strong>Click on the map</strong> to set the destination';
            document.getElementById('btnSelectEnd').classList.add('active');
        }
    }

    async calculateRoute() {
        const startAddr = document.getElementById('startLocation').value;
        const endAddr = document.getElementById('endLocation').value;
        const statusDiv = document.getElementById('navStatus');

        if (!startAddr || !endAddr) return statusDiv.innerHTML = '<span class="text-danger">Please fill in both locations.</span>';
        statusDiv.innerHTML = '<span class="text-info">Looking up coordinates...</span>';

        const startCoords = await this.mapApi.getCoordinates(startAddr);
        const endCoords = await this.mapApi.getCoordinates(endAddr);

        if (!startCoords || !endCoords) return statusDiv.innerHTML = '<span class="text-danger">Location not found.</span>';

        try {
            this.alternativeRoutes = await this.mapApi.getRoutes(startCoords, endCoords);
            if (this.alternativeRoutes.length === 0) return statusDiv.innerHTML = '<span class="text-danger">No route found.</span>';

            if (this.allRoutesGroup) this.map.removeLayer(this.allRoutesGroup);
            this.allRoutesGroup = L.featureGroup().addTo(this.map);

            let html = '<div class="btn-group w-100 mb-2" role="group">';
            this.alternativeRoutes.forEach((f, i) => {
                html += `<button type="button" class="btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-outline-secondary'} route-select-btn" data-index="${i}">Option ${i + 1}<br>${(f.properties.summary.distance / 1000).toFixed(2)} km</button>`;
            });
            statusDiv.innerHTML = html + '</div>';
            
            this.selectRoute(0);
            this._placeMarker('end', endCoords);
            this._placeMarker('start', startCoords);
        } catch (err) {
            statusDiv.innerHTML = '<span class="text-danger">Error connecting to server.</span>';
        }
    }

    selectRoute(selectedIndex) {
        this.allRoutesGroup.clearLayers();
        document.querySelectorAll('.route-select-btn').forEach((btn, i) => {
            btn.classList.toggle('btn-primary', i === selectedIndex);
            btn.classList.toggle('btn-outline-secondary', i !== selectedIndex);
        });

        this.alternativeRoutes.forEach((feature, index) => {
            if (index !== selectedIndex) L.geoJSON(feature, { style: { color: '#adb5bd', weight: 3, dashArray: '5, 5' } }).addTo(this.allRoutesGroup);
        });
        L.geoJSON(this.alternativeRoutes[selectedIndex], { style: { color: '#0d6efd', weight: 6, dashArray: '10, 10' } }).addTo(this.allRoutesGroup);

        this.map.fitBounds(this.allRoutesGroup.getBounds(), { padding: [30, 30] });

        this.currentRouteText = `Navigation instructions for option ${selectedIndex + 1}. `;
        let stepsHtml = `<div class="list-group-item bg-primary text-white fw-bold sticky-top d-flex justify-content-between align-items-center py-1">
                <span>🚶 Instructions for option ${selectedIndex + 1}:</span>
                <button id="btnReadRoute" class="btn btn-sm btn-light text-dark fw-bold py-0 px-2">🔊 Read</button>
            </div>`;

        this.alternativeRoutes[selectedIndex].properties.segments[0].steps.forEach((step) => {
            if (!(step.distance > 0 || step.type === 10)) return;
            stepsHtml += `<div class="list-group-item py-1"><strong>${step.instruction}</strong>${step.distance > 0 ? `<br><span class="text-muted">in ${Math.round(step.distance)} m</span>` : ''}</div>`;
            this.currentRouteText += `${step.instruction}${step.distance > 0 ? `, for ${Math.round(step.distance)} meters` : ''}. `;
        });
        document.getElementById('routeSteps').innerHTML = stepsHtml;
    }
}