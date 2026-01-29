// Initialize Cities Data
let citiesData = [];

// Constants for astrology metadata
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const NAKSHATRAS = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra","Punarvasu","Pushya","Ashlesha",
    "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
    "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

// Light interpretations (short, friendly)
const SIGN_TRAITS = {
    "Aries": "Bold, initiates quickly, wants action now.",
    "Taurus": "Steady, practical, values comfort and stability.",
    "Gemini": "Curious, communicative, loves learning and sharing.",
    "Cancer": "Nurturing, intuitive, protects what feels like home.",
    "Leo": "Expressive, confident, seeks to shine and inspire.",
    "Virgo": "Analytical, helpful, improves systems and details.",
    "Libra": "Diplomatic, partnership-oriented, seeks balance.",
    "Scorpio": "Intense, investigative, transforms through depth.",
    "Sagittarius": "Visionary, adventurous, explores big ideas.",
    "Capricorn": "Strategic, disciplined, builds lasting results.",
    "Aquarius": "Inventive, future-minded, values community change.",
    "Pisces": "Empathic, imaginative, flows with subtle currents."
};

const HOUSE_THEMES = {
    1: "Self, vitality, personal drive.",
    2: "Resources, values, possessions.",
    3: "Communication, siblings, skills.",
    4: "Home, roots, emotional base.",
    5: "Creativity, romance, expression.",
    6: "Health, routines, service.",
    7: "Partnerships, agreements, visibility.",
    8: "Depth work, shared assets, rebirth.",
    9: "Beliefs, learning, journeys.",
    10: "Career, reputation, leadership.",
    11: "Allies, community, gains.",
    12: "Rest, intuition, release."
};

const PLANET_TONES = {
    "Sun": "Identity and leadership", "Moon": "Emotions and intuition", "Mercury": "Thinking and communication",
    "Venus": "Connection and harmony", "Mars": "Drive and courage", "Jupiter": "Wisdom and growth",
    "Saturn": "Structure and discipline", "Uranus": "Innovation and change", "Neptune": "Imagination and faith",
    "Rahu": "Desire and worldly focus", "Ketu": "Release and spirituality"
};

const TITHI_NAMES = [
    "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami",
    "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima",
    "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami",
    "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Amavasya"
];

const DASA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

const TITHI_MEANINGS = [
    "Fresh starts and intention setting.",
    "Cooperation, pairing up, steadying plans.",
    "Momentum, skill-building, creative flow.",
    "Problem-solving and breakthroughs.",
    "Learning, adaptability, refining ideas.",
    "Organization, discipline, practical steps.",
    "Visibility, vitality, showing your work.",
    "Tests of balance and courage.",
    "Determination to clear obstacles.",
    "Planning, delegation, responsible action.",
    "Clarity, focus, lightening what is heavy.",
    "Integration, gentle purification.",
    "Agreements, harmony, collaborative wins.",
    "Release, intensity, preparing to conclude.",
    "Fullness, gratitude, honoring peak energy.",
    "Reset, humility, tending foundations.",
    "Stability, rebuilding, patient progress.",
    "Revisiting choices, flexible course-correction.",
    "Mending, simplifying, removing friction.",
    "Care, healing, conscious nourishment.",
    "Maintenance, steady work, wellness routines.",
    "Balanced relating, feedback, perspective.",
    "Inner work, releasing attachments.",
    "Sorting truths from noise.",
    "Faith, pilgrimage, reframing beliefs.",
    "Leadership, duty, honoring commitments.",
    "Community, friends, mutual aid.",
    "Quiet reflection, closing loops.",
    "Deep release, forgiveness, surrender.",
    "Seed time, rest, inner renewal."
];

// Helpers
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const SEGMENT_NAK = 360 / 27; // 13°20'
const SEGMENT_PADA = SEGMENT_NAK / 4; // 3°20'
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

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

function calcTithiPaksha(sunSid, moonSid) {
    const diff = normalizeDeg(moonSid - sunSid);
    const tithiNum = Math.floor(diff / 12) + 1; // 1..30
    const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';
    const name = TITHI_NAMES[tithiNum - 1] || `Tithi ${tithiNum}`;
    const meaning = TITHI_MEANINGS[tithiNum - 1] || '';
    return { tithiNum, paksha, name, label: `${name} (${paksha})`, meaning };
}

function downloadChartPNG() {
    try {
        const canvas = document.getElementById('northChart');
        const link = document.createElement('a');
        link.download = 'kundali-chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (e) {
        alert('Unable to download chart.');
        console.error('Download chart failed', e);
    }
}

async function downloadKundaliPDF() {
    try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF || typeof html2canvas !== 'function') {
            throw new Error('PDF dependencies not loaded');
        }

        const chartCanvas = document.getElementById('northChart');
        const tableEl = document.querySelector('.planet-table');
        if (!chartCanvas || !tableEl) {
            throw new Error('Chart or table not found');
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        let cursorY = 48;

        doc.setFontSize(16);
        doc.text('Kundali Report', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 18;

        const chartData = chartCanvas.toDataURL('image/png');
        const chartWidth = Math.min(pageWidth - 80, 360);
        const chartHeight = chartWidth;
        doc.addImage(chartData, 'PNG', (pageWidth - chartWidth) / 2, cursorY, chartWidth, chartHeight);
        cursorY += chartHeight + 20;

        const tableCanvas = await html2canvas(tableEl, { scale: 2 });
        const tableData = tableCanvas.toDataURL('image/png');
        const tableWidth = pageWidth - 60;
        const tableHeight = (tableCanvas.height * tableWidth) / tableCanvas.width;
        doc.addImage(tableData, 'PNG', 30, cursorY, tableWidth, tableHeight);

        doc.save('kundali-report.pdf');
    } catch (e) {
        alert('Unable to export PDF right now.');
        console.error('PDF export failed', e);
    }
}

function copyTableCSV() {
    try {
        const rows = Array.from(document.querySelectorAll('#planetBody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.innerText.replace(/,/g, ';')).join(',')
        );
        const header = ['Planet','Rashi (Sign)','Degrees','Nakshatra','Retrograde','House'].join(',');
        const csv = [header, ...rows].join('\n');
        navigator.clipboard.writeText(csv).then(() => {
            alert('Planetary table copied as CSV');
        }).catch(() => {
            prompt('Copy CSV:', csv);
        });
    } catch (e) {
        console.error('Copy CSV failed', e);
        alert('Unable to copy CSV.');
    }
}

function toggleKundaliLanguage() {
    const current = document.documentElement.lang === 'hi' ? 'hi' : 'en';
    const target = current === 'hi' ? 'kundali.html' : 'kundali-hi.html';
    window.location.href = target;
}

function computePanchangToday() {
    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);
    if (isNaN(lat) || isNaN(lon)) {
        alert('Please select a city first.');
        return;
    }
    computePanchang(new Date(), lat, lon);
}

function computePanchang(date, lat, lon) {
    try {
        if (typeof Astronomy === 'undefined') throw new Error('Astronomy not loaded');

        const ayanamsa = calculateLahiriAyanamsa(date);
        const astroTime = Astronomy.MakeTime(date);
        if (!astroTime) throw new Error('Time object failed');

        const sunVec = Astronomy.GeoVector('Sun', astroTime, true);
        const moonVec = Astronomy.GeoMoon(astroTime);
        const sunLonTrop = Astronomy.Ecliptic(sunVec).elon;
        const moonLonTrop = Astronomy.Ecliptic(moonVec).elon;

        const sunSid = normalizeDeg(sunLonTrop - ayanamsa);
        const moonSid = normalizeDeg(moonLonTrop - ayanamsa);

        const tithi = calcTithiPaksha(sunSid, moonSid);
        const nak = calcNakshatra(moonSid);
        const moonPhaseAngle = normalizeDeg(moonLonTrop - sunLonTrop);
        const phaseLabel = describePhase(moonPhaseAngle);

        updatePanchangPanel({
            tithi,
            nak,
            phaseLabel,
            weekday: WEEKDAYS[date.getDay()],
            date
        });
    } catch (e) {
        console.error('Panchang error', e);
        alert('Unable to fetch panchang right now.');
    }
}

function describePhase(angle) {
    if (angle < 10 || angle > 350) return 'New Moon';
    if (angle < 80) return 'Waxing Crescent';
    if (angle < 100) return 'First Quarter';
    if (angle < 170) return 'Waxing Gibbous';
    if (angle < 190) return 'Full Moon';
    if (angle < 260) return 'Waning Gibbous';
    if (angle < 280) return 'Last Quarter';
    if (angle < 350) return 'Waning Crescent';
    return 'Moon Phase';
}

function updatePanchangPanel(info) {
    const box = document.getElementById('panchangPanel');
    if (!box) return;
    box.style.display = 'block';

    const dateStr = info.date ? info.date.toLocaleDateString() : '';
    const tithiEl = document.getElementById('panchangTithi');
    const nakEl = document.getElementById('panchangNakshatra');
    const phaseEl = document.getElementById('panchangMoonPhase');
    const weekdayEl = document.getElementById('panchangWeekday');
    const dateEl = document.getElementById('panchangDate');

    if (tithiEl && info.tithi) tithiEl.innerText = `${info.tithi.label}${info.tithi.meaning ? ' — ' + info.tithi.meaning : ''}`;
    if (nakEl && info.nak) nakEl.innerText = `${info.nak.name} (Pada ${info.nak.pada})`;
    if (phaseEl && info.phaseLabel) phaseEl.innerText = info.phaseLabel;
    if (weekdayEl && info.weekday) weekdayEl.innerText = info.weekday;
    if (dateEl && dateStr) dateEl.innerText = dateStr;
}

function generateMoonCalendar() {
    try {
        if (typeof Astronomy === 'undefined') throw new Error('Astronomy not loaded');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rows = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date(today.getTime() + i * 24 * 3600 * 1000);
            const astroTime = Astronomy.MakeTime(d);
            const sunLon = Astronomy.Ecliptic(Astronomy.GeoVector('Sun', astroTime, true)).elon;
            const moonLon = Astronomy.Ecliptic(Astronomy.GeoMoon(astroTime)).elon;
            const angle = normalizeDeg(moonLon - sunLon);
            const phase = describePhase(angle);
            const illum = Math.round((1 - Math.cos(angle * DEG2RAD)) * 50 * 10) / 10; // 0-100%
            rows.push({ date: d.toLocaleDateString(), phase, illum });
        }
        window.__moonCalendarData = rows;
        renderMoonCalendar(rows);
    } catch (e) {
        console.error('Moon calendar error', e);
        alert('Unable to generate moon calendar.');
    }
}

function renderMoonCalendar(rows) {
    const panel = document.getElementById('moonCalendarPanel');
    const body = document.getElementById('moonCalendarBody');
    if (!panel || !body) return;
    panel.style.display = 'block';
    body.innerHTML = rows.map(r => `<tr><td>${r.date}</td><td>${r.phase}</td><td>${r.illum}%</td></tr>`).join('');
}

function downloadMoonCalendarCSV() {
    const rows = window.__moonCalendarData || [];
    if (!rows.length) {
        alert('Generate the moon calendar first.');
        return;
    }
    const header = ['Date','Phase','Illumination%'];
    const csv = [header.join(','), ...rows.map(r => `${r.date},${r.phase},${r.illum}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'moon-calendar.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function computeMahadashaTimeline(birthDate, moonSid) {
    if (isNaN(birthDate)) return [];
    const idx = Math.floor(normalizeDeg(moonSid) / SEGMENT_NAK);
    const lord = DASA_ORDER[idx % 9];
    const fraction = (normalizeDeg(moonSid) % SEGMENT_NAK) / SEGMENT_NAK;
    const remainingYears = DASA_YEARS[lord] * (1 - fraction);
    const timeline = [];

    let start = new Date(birthDate.getTime());
    let end = addYearsFraction(start, remainingYears);
    timeline.push({ lord, start, end, years: remainingYears });

    let cursorIndex = (idx + 1) % 9;
    start = end;
    for (let i = 0; i < 8; i++) {
        const l = DASA_ORDER[cursorIndex];
        const yrs = DASA_YEARS[l];
        end = addYearsFraction(start, yrs);
        timeline.push({ lord: l, start, end, years: yrs });
        start = end;
        cursorIndex = (cursorIndex + 1) % 9;
    }
    return timeline;
}

function addYearsFraction(date, years) {
    const ms = years * 365.25 * 24 * 3600 * 1000;
    return new Date(date.getTime() + ms);
}

function renderMahadasha(timeline) {
    const panel = document.getElementById('mahadashaPanel');
    const body = document.getElementById('mahadashaBody');
    if (!panel || !body) return;
    if (!timeline || !timeline.length) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    body.innerHTML = timeline.map(item => {
        const start = item.start.toLocaleDateString();
        const end = item.end.toLocaleDateString();
        return `<tr><td>${item.lord}</td><td>${start}</td><td>${end}</td><td>${item.years.toFixed(1)} yrs</td></tr>`;
    }).join('');
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
    let sunSid = null;
    let moonSid = null;
    
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

                if (p === 'Sun') sunSid = siderealLon;
                if (p === 'Moon') moonSid = siderealLon;
                
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

        // Tithi/Paksha and weekday
        let tithiInfo = null;
        if (sunSid !== null && moonSid !== null) {
            tithiInfo = calcTithiPaksha(sunSid, moonSid);
            const tithiEl = document.getElementById('tithiDisplay');
            if (tithiEl) tithiEl.innerText = tithiInfo.label;
            const tithiMeaningEl = document.getElementById('tithiMeaning');
            if (tithiMeaningEl && tithiInfo.meaning) {
                tithiMeaningEl.innerText = `${tithiInfo.name}: ${tithiInfo.meaning}`;
            }
        }
        const weekdayEl = document.getElementById('weekdayDisplay');
        if (weekdayEl) weekdayEl.innerText = WEEKDAYS[date.getDay()];

        const mahadashaTimeline = (moonSid !== null) ? computeMahadashaTimeline(date, moonSid) : [];

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

        // 5. Interpretations
        renderInterpretations(planetaryPositions, ascendant, tithiInfo);

        // 6. Mahadasha timeline
        renderMahadasha(mahadashaTimeline);

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

    function renderInterpretations(planets, ascendant, tithiInfo) {
        const listEl = document.getElementById('planetInterpretations');
        if (!listEl) return;

        const ascText = ascendant ? SIGNS[Math.floor(ascendant.sidereal / 30)] : 'Ascendant';
        listEl.innerHTML = '';

        planets.forEach((p) => {
            const base = getPlanetBase(p.name);
            const signText = SIGN_TRAITS[p.sign] || `${p.sign} emphasizes distinct lessons.`;
            const houseText = HOUSE_THEMES[p.house] || `House ${p.house} themes add context.`;
            const planetTone = PLANET_TONES[base] ? `${PLANET_TONES[base]}.` : '';
            const para = document.createElement('p');
            para.className = 'interp-line';
            const nakSnippet = p.nakshatra ? ` Nakshatra: ${p.nakshatra}.` : '';
            para.textContent = `${base} in ${p.sign} (House ${p.house}): ${planetTone} ${signText} ${houseText}${nakSnippet}`.trim();
            listEl.appendChild(para);
        });

        const ascEl = document.getElementById('ascInterpret');
        if (ascEl) {
            ascEl.innerText = `Ascendant in ${ascText}: Your default style of moving through life and the filter others notice first.`;
        }

        const tithiBox = document.getElementById('tithiInterpret');
        if (tithiBox && tithiInfo) {
            const suffix = tithiInfo.paksha === 'Shukla' ? 'growing moon favors building.' : 'waning moon favors release.';
            tithiBox.innerText = `${tithiInfo.name} (${tithiInfo.paksha} Paksha): ${tithiInfo.meaning} The ${suffix}`;
        }
    }

    function getPlanetBase(name) {
        if (!name) return '';
        if (name.startsWith('Rahu')) return 'Rahu';
        if (name.startsWith('Ketu')) return 'Ketu';
        return name.split(' ')[0];
    }
