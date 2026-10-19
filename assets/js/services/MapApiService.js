export default class MapApiService {
    constructor(routeApiKey, { countryCodes = 'il', lang = 'en' } = {}) {
        this.routeApiKey = routeApiKey;
        this.countryCodes = countryCodes;
        this.lang = lang;
        this.routeUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
    }

    async reverseGeocode(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${this.lang}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }

    async searchAddress(query, limit = 5) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${this.countryCodes}&accept-language=${this.lang}&limit=${limit}`;
        const res = await fetch(url);
        return res.json();
    }

    async getCoordinates(address) {
        try {
            const results = await this.searchAddress(address, 1);
            if (results && results.length > 0) {
                return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
            }
            return null;
        } catch (err) {
            console.error('Geocoding error:', err);
            return null;
        }
    }

    async getRoutes(startCoords, endCoords) {
        const requestBody = {
            coordinates: [
                [startCoords.lon, startCoords.lat],
                [endCoords.lon, endCoords.lat]
            ],
            alternative_routes: { target_count: 3, weight_factor: 1.4 },
            instructions: true
        };

        const res = await fetch(this.routeUrl, {
            method: 'POST',
            headers: {
                Authorization: this.routeApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        if (!data.features || data.features.length === 0) return [];

        return data.features.sort(
            (a, b) => a.properties.summary.distance - b.properties.summary.distance
        );
    }
}