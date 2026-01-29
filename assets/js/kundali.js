// Initialize Cities Data
let citiesData = [];

// Constants for astrology metadata
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const NAKSHATRAS = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

// Helpers
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const SEGMENT_NAK = 360 / 27; // 13°20'
const SEGMENT_PADA = SEGMENT_NAK / 4; // 3°20'

function normalizeDeg(val) {
    return ((val % 360) + 360) % 360;
}

function normalizeDelta(val) {
    // Return delta in range [-180, 180)
    const d = ((val + 180) % 360 + 360) % 360 - 180;
    return d;
}

function centuriesSinceJ2000(date) {
    const J2000 = new Date('2000-01-01T12:00:00Z');
    const days = (date - J2000) / (1000 * 60 * 60 * 24);
    return days / 36525;
}

function meanObliquityDeg(T) {
    // Simple mean obliquity approximation (deg)
    return 23.439291 - 0.0130042 * T;
}

function calcAscendantSidereal(date, latDeg, lonDeg, ayanamsa) {
    const T = centuriesSinceJ2000(date);
    const eps = meanObliquityDeg(T) * DEG2RAD;

    const astroTime = Astronomy.MakeTime(date);
    let gstHours = Astronomy.SiderealTime(astroTime); // Greenwich sidereal time (hours)
    let lstHours = gstHours + lonDeg / 15;
    lstHours = ((lstHours % 24) + 24) % 24;
    const theta = lstHours * Math.PI / 12; // convert hours to radians (24h = 2π)
    const phi = latDeg * DEG2RAD;

    // Formula for ecliptic longitude of ascendant
    const ascRad = Math.atan2(
        Math.sin(theta),
        Math.cos(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps)
    );

    const ascDeg = normalizeDeg(ascRad * RAD2DEG);
    const ascSid = normalizeDeg(ascDeg - ayanamsa);
    return { tropical: ascDeg, sidereal: ascSid };
}

function calcNakshatra(siderealLon) {
    const idx = Math.floor(normalizeDeg(siderealLon) / SEGMENT_NAK);
    const pada = Math.floor((normalizeDeg(siderealLon) % SEGMENT_NAK) / SEGMENT_PADA) + 1;
    return { name: NAKSHATRAS[idx], pada };
}

function calcMeanNodes(date, ayanamsa) {
    const T = centuriesSinceJ2000(date);
    let rahu = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
    rahu = normalizeDeg(rahu);
    const ketu = normalizeDeg(rahu + 180);
    return {
        rahuSid: normalizeDeg(rahu - ayanamsa),
        ketuSid: normalizeDeg(ketu - ayanamsa)
    };
}

function isRetrograde(body, astroTime, date) {
    // Skip retrograde calc for Sun/Moon
    if (body === 'Sun' || body === 'Moon') return false;
    const prev = astroTime.AddDays(-1);

    const vecNow = (body === 'Moon' || (Astronomy.Body && body === Astronomy.Body.Moon))
        ? Astronomy.GeoMoon(astroTime)
        : Astronomy.GeoVector(body, astroTime, true);
    const vecPrev = (body === 'Moon' || (Astronomy.Body && body === Astronomy.Body.Moon))
        ? Astronomy.GeoMoon(prev)
        : Astronomy.GeoVector(body, prev, true);

    const lonNow = Astronomy.Ecliptic(vecNow).elon;
    const lonPrev = Astronomy.Ecliptic(vecPrev).elon;
    const delta = normalizeDelta(lonNow - lonPrev);
    return delta < 0;
}

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
        const name = document.getElementById('name').value;

        if (!dateStr || !timeStr || isNaN(lat)) {
            alert("Please enter all details and select a city from the list.");
            return;
        }

        if (name) {
             document.getElementById('resultName').innerText = name + "'s";
        }

        const date = new Date(dateStr + 'T' + timeStr);
        
    if (isNaN(date.getTime())) {
        alert("Invalid Date/Time format.");
        return;
    }

    
    // 1. Calculate Ayanamsa (Lahiri)
    let ayanamsa = 0;
    try {
        ayanamsa = calculateLahiriAyanamsa(date);
    } catch(e) {
        console.error("Ayanamsa Calc Error", e);
    }

    // 2. Ascendant (sidereal)
    let ascendant = { tropical: 0, sidereal: 0 };
    try {
        ascendant = calcAscendantSidereal(date, lat, lon, ayanamsa);
    } catch (ascErr) {
        console.error('Ascendant calc error', ascErr);
    }

    // 3. Mean Rahu/Ketu (sidereal)
    const nodes = calcMeanNodes(date, ayanamsa);

    // 4. Calculate Planets
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const planetaryPositions = [];
    
    try {
        const astroTime = Astronomy.MakeTime(date);
        
        if (!astroTime) {
            throw new Error("Astronomy.MakeTime returned null/undefined");
        }
        if (typeof astroTime.tt === 'undefined') {
            throw new Error("astroTime.tt is undefined. Time object invalid.");
        }

        let failureCount = 0;
        let lastErrorMessage = "";

        planets.forEach(p => {
            try {
                // Prefer the library's Body enum when available.
                const body = (Astronomy.Body && Astronomy.Body[p]) ? Astronomy.Body[p] : p;

                // In our bundled astronomy.min.js, Astronomy.Ecliptic() takes a VECTOR,
                // so obtain a geocentric vector first.
                let vec;
                if (body === 'Moon' || (Astronomy.Body && body === Astronomy.Body.Moon)) {
                    if (typeof Astronomy.GeoMoon !== 'function') {
                        throw new Error('Astronomy.GeoMoon is not available');
                    }
                    vec = Astronomy.GeoMoon(astroTime);
                } else {
                    if (typeof Astronomy.GeoVector !== 'function') {
                        throw new Error('Astronomy.GeoVector is not available');
                    }
                    // aberration=true for apparent geocentric position
                    vec = Astronomy.GeoVector(body, astroTime, true);
                }

                if (!vec || !vec.t || typeof vec.t.tt === 'undefined') {
                    throw new Error(`Invalid vector returned for ${p}`);
                }

                const tropical = Astronomy.Ecliptic(vec);
                
                if (!tropical) {
                    throw new Error(`Astronomy.Ecliptic returned nothing for ${p}`);
                }
                
                let siderealLon = normalizeDeg(tropical.elon - ayanamsa);
                
                const signIndex = Math.floor(siderealLon / 30);
                const degrees = siderealLon % 30;
                const nak = calcNakshatra(siderealLon);
                const retro = isRetrograde(p, astroTime, date);
                const house = ((Math.floor(normalizeDeg(siderealLon - ascendant.sidereal) / 30)) % 12) + 1;
                
                planetaryPositions.push({
                    name: p,
                    sign: SIGNS[signIndex],
                    signIndex: signIndex + 1, // 1-12
                    deg: degrees.toFixed(2),
                    absDeg: siderealLon,
                    nakshatra: `${nak.name} (Pada ${nak.pada})`,
                    retrograde: retro,
                    house
                });
            } catch (planetError) {
                console.error(`Error calculating ${p}:`, planetError);
                failureCount += 1;
                if (!lastErrorMessage) lastErrorMessage = planetError && planetError.message ? planetError.message : String(planetError);
                // Add a placeholder to avoid breaking the chart
                planetaryPositions.push({
                    name: p + " (Err)",
                    sign: "Error",
                    signIndex: 1,
                    deg: "0.00",
                    absDeg: 0,
                    nakshatra: "-",
                    retrograde: false,
                    house: 1
                });
            }
        });

        if (failureCount === planets.length) {
            throw new Error("All planetary calculations failed. " + (lastErrorMessage ? ("Last error: " + lastErrorMessage) : ""));
        }
    } catch (innerError) {
        console.error("Global Calc Error:", innerError);
        alert("Critical Error: " + innerError.message);
        return;
    }

    // Add Rahu/Ketu
    planetaryPositions.push({
        name: 'Rahu (North Node)',
        sign: SIGNS[Math.floor(nodes.rahuSid / 30)],
        signIndex: Math.floor(nodes.rahuSid / 30) + 1,
        deg: (nodes.rahuSid % 30).toFixed(2),
        absDeg: nodes.rahuSid,
        nakshatra: (() => { const n = calcNakshatra(nodes.rahuSid); return `${n.name} (Pada ${n.pada})`; })(),
        retrograde: true,
        house: ((Math.floor(normalizeDeg(nodes.rahuSid - ascendant.sidereal) / 30)) % 12) + 1
    });

    planetaryPositions.push({
        name: 'Ketu (South Node)',
        sign: SIGNS[Math.floor(nodes.ketuSid / 30)],
        signIndex: Math.floor(nodes.ketuSid / 30) + 1,
        deg: (nodes.ketuSid % 30).toFixed(2),
        absDeg: nodes.ketuSid,
        nakshatra: (() => { const n = calcNakshatra(nodes.ketuSid); return `${n.name} (Pada ${n.pada})`; })(),
        retrograde: true,
        house: ((Math.floor(normalizeDeg(nodes.ketuSid - ascendant.sidereal) / 30)) % 12) + 1
    });
        const ascSign = SIGNS[Math.floor(ascendant.sidereal / 30)];
        const ascDeg = (ascendant.sidereal % 30).toFixed(2);
        const ascEl = document.getElementById('ascDisplay');
        const ascLabel = document.getElementById('ascLabel');
        if (ascEl) ascEl.innerText = `${ascSign} ${ascDeg}°`;
        if (ascLabel) ascLabel.innerText = `Lagna (${ascSign})`;

        const tbody = document.getElementById('planetBody');
        tbody.innerHTML = '';
        planetaryPositions.forEach(p => {
            const row = `<tr>
                <td>${p.name}</td>
                <td>${p.sign}</td>
                <td>${p.deg}°</td>
                <td>${p.nakshatra}</td>
                <td>${p.retrograde ? 'Yes' : 'No'}</td>
                <td>${p.house}</td>
            </tr>`;
            tbody.innerHTML += row;
        });

        // 4. Draw Chart
        drawNorthIndianChart(planetaryPositions, ascendant);

        // Override share link with filled inputs so users can share this chart state
        try {
            const params = new URLSearchParams({
                name: name || '',
                dob: dateStr,
                tob: timeStr,
                city: cityName || '',
                lat: lat.toFixed(4),
                lon: lon.toFixed(4)
            });
            window.__shareUrlOverride = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
            window.__shareTextOverride = `${name ? name + "'s" : 'My'} Kundali Chart | Divine Destiny`;
        } catch (shareErr) {
            console.warn('Share link not set', shareErr);
        }

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

function drawNorthIndianChart(planets, ascendant) {
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
    const ascSign = ascendant ? SIGNS[Math.floor(ascendant.sidereal / 30)] : 'Asc';
    ctx.fillText(`Lagna (${ascSign})`, w/2, h/2 - 20);
    
    // Just listing planets in center for MVP visual proof
    // Real mapping requires House calculation
}
