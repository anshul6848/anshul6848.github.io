// Initialize Cities Data
let citiesData = [];

// Load cities on page load
fetch('../assets/data/cities.json')
    .then(response => response.json())
    .then(data => {
        citiesData = data;
    })
    .catch(error => console.error('Error loading cities:', error));

// City Autocomplete Logic
const cityInput = document.getElementById('cityInput');
const cityList = document.getElementById('cityList');

cityInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    cityList.innerHTML = '';
    cityList.style.display = 'none';

    if (value.length < 2) return;

    const filtered = citiesData.filter(city => city.name.toLowerCase().includes(value)).slice(0, 10);
    
    if (filtered.length > 0) {
        cityList.style.display = 'block';
        filtered.forEach(city => {
            const div = document.createElement('div');
            div.className = 'city-option';
            div.textContent = `${city.name}`; // Could add country code here if in JSON
            div.onclick = function() {
                cityInput.value = city.name;
                document.getElementById('latitude').value = city.lat;
                document.getElementById('longitude').value = city.lon;
                cityList.style.display = 'none';
            };
            cityList.appendChild(div);
        });
    }
});

// Close dropdown if clicked outside
document.addEventListener('click', function(e) {
    if (e.target !== cityInput) {
        cityList.style.display = 'none';
    }
});

function generateKundali() {
    try {
        if (typeof Astronomy === 'undefined') {
            alert("Error: Astronomy library not loaded. Please allow scripts or check internet connection.");
            return;
        }

        const dateStr = document.getElementById('dob').value;
        const timeStr = document.getElementById('tob').value;
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);
        const cityName = document.getElementById('cityInput').value;

        if (!dateStr || !timeStr || isNaN(lat)) {
            alert("Please enter all details and select a city from the list.");
            return;
        }

        const date = new Date(dateStr + 'T' + timeStr);
        
        // 1. Calculate Ayanamsa (Lahiri)
        const ayanamsa = calculateLahiriAyanamsa(date);

        // 2. Calculate Planets
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        
        const planetaryPositions = [];

        planets.forEach(p => {
             // Verify Body exists
            if (!Astronomy.Body[p]) {
                console.warn(`Astronomy.Body[${p}] not found.`);
                return; 
            }
            const body = Astronomy.Body[p];
            const tropical = Astronomy.Ecliptic(body, date);
            
            let siderealLon = tropical.elon - ayanamsa;
            if (siderealLon < 0) siderealLon += 360;
            
            const signIndex = Math.floor(siderealLon / 30);
            const degrees = siderealLon % 30;
            
            planetaryPositions.push({
                name: p,
                sign: signs[signIndex],
                signIndex: signIndex + 1, // 1-12
                deg: degrees.toFixed(2),
                absDeg: siderealLon
            });
        });

        // 3. Populate Table
        const tbody = document.getElementById('planetBody');
        tbody.innerHTML = '';
        planetaryPositions.forEach(p => {
            const row = `<tr>
                <td>${p.name}</td>
                <td>${p.sign}</td>
                <td>${p.deg}°</td>
            </tr>`;
            tbody.innerHTML += row;
        });

        // 4. Draw Chart
        drawNorthIndianChart(planetaryPositions);

        document.getElementById('result').style.display = 'block';
        document.getElementById('result').scrollIntoView({behavior: 'smooth'});
        
    } catch(e) {
        console.error(e);
        alert("An error occurred while generating the chart: " + e.message);
    }
}

function calculateLahiriAyanamsa(date) {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const daysDiff = (date - J2000) / (1000 * 60 * 60 * 24);
    const yearsDiff = daysDiff / 365.25;
    
    // Base Lahiri at J2000: 23.85 degrees approx
    // Precession rate: 50.29 arcsec/year (~0.01397 deg/year)
    const base = 23.85; 
    const rate = 0.01397;
    return base + (yearsDiff * rate);
}

function drawNorthIndianChart(planets) {
    const canvas = document.getElementById('northChart');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw Border
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    
    // Draw Diagonals (The X)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, h);
    ctx.moveTo(w, 0);
    ctx.lineTo(0, h);
    ctx.stroke();
    
    // Draw Diamond (The Midpoints)
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w, h/2);
    ctx.lineTo(w/2, h);
    ctx.lineTo(0, h/2);
    ctx.closePath();
    ctx.stroke();

    // Labels/Houses would go here
    // This is a static "Chart Structure" visual for now.
    // To make it real, we need the Ascendant to place House 1.
    // In Phase 2, we will add the Ascendant calculation to place planets in correct houses.
    
    ctx.fillStyle = '#4c1d95';
    ctx.font = '16px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText("Lagna (Asc)", w/2, h/2 - 20);
    
    // Just listing planets in center for MVP visual proof
    // Real mapping requires House calculation
}
