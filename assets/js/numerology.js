// Chaldean Numerology Chart
const chaldeanTable = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'U': 6, 'V': 6, 'W': 6,
    'O': 7, 'Z': 7,
    'F': 8, 'P': 8
};

const numberMeanings = {
    1: "LEADER: You have a strong vibration of independence and ambition. You are a natural born leader who prefers to originate rather than follow.",
    2: "PEACEMAKER: You are gentle, imaginative, and diplomatic. You work best in partnerships and have a healing presence.",
    3: "COMMUNICATOR: You are optimistic, expressive, and creative. You bring joy to others through your words and artistic talents.",
    4: "BUILDER: You are practical, disciplined, and trustworthy. You build solid foundations and are the rock for your family.",
    5: "ADVENTURER: You crave freedom, travel, and variety. You are adaptable and magnetic, always seeking new experiences.",
    6: "NURTURER: You are responsible, loving, and protective. Home and family are your universe, and you love to serve others.",
    7: "SEEKER: You are analytical, spiritual, and introspective. You seek the deeper truths of life and need quiet time to recharge.",
    8: "ACHIEVER: You are ambitious, efficient, and business-minded. You have the potential for great material success and power.",
    9: "HUMANITARIAN: You are compassionate, selfless, and wise. You view the world broadly and wish to make it a better place."
};

const compatibilityNotes = [
    { maxDiff: 0, text: "Deeply aligned; you share core drives." },
    { maxDiff: 1, text: "Strong harmony with complementary strengths." },
    { maxDiff: 2, text: "Balanced duo; small adjustments create flow." },
    { maxDiff: 3, text: "Mixed; clarity and patience improve sync." },
    { maxDiff: 9, text: "Opposite currents; respect differences." }
];

function trackEvent(action, params = {}) {
    try {
        if (window.gtag) window.gtag('event', action, params);
    } catch (e) {
        console.warn('track skip', action, e);
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') calculateNumerology();
}

function calculateNumerology() {
    const raw = document.getElementById('nameInput').value;
    const name = raw.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!name) {
        alert("Please enter a name");
        return;
    }

    const total = calcNameNumber(name);
    if (total === 0) {
        alert("Please enter a valid name using letters.");
        return;
    }

    const reduced = reduceNumber(total);
    const resultDiv = document.getElementById('result');
    const numberEl = document.getElementById('destinyNumber') || document.getElementById('finalNumber');
    const meaningEl = document.getElementById('destinyMeaning') || document.getElementById('numberMeaning');

    if (numberEl) numberEl.innerText = reduced;
    if (meaningEl) meaningEl.innerText = numberMeanings[reduced] || "A unique vibration of potential.";

    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
    trackEvent('numerology_name_calculated', { number: reduced });
}

function calcNameNumber(name) {
    let total = 0;
    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (chaldeanTable[char]) {
            total += chaldeanTable[char];
        }
    }
    return total;
}

function reduceNumber(num) {
    while (num > 9) {
        num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return num;
}

function lifePathFromDOB(dobStr) {
    if (!dobStr) return null;
    const digits = dobStr.replace(/\D/g, '');
    if (!digits) return null;
    return reduceNumber(parseInt(digits, 10));
}

function calculateCompatibility() {
    const rawA = document.getElementById('compNameA').value;
    const rawB = document.getElementById('compNameB').value;
    const nameA = rawA.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ').trim();
    const nameB = rawB.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ').trim();
    const dobA = document.getElementById('compDobA').value;
    const dobB = document.getElementById('compDobB').value;

    if (!nameA || !nameB || !dobA || !dobB) {
        alert('Please fill both names and birth dates.');
        return;
    }

    const nameNumA = reduceNumber(calcNameNumber(nameA));
    const nameNumB = reduceNumber(calcNameNumber(nameB));
    const lifeA = lifePathFromDOB(dobA);
    const lifeB = lifePathFromDOB(dobB);

    if (lifeA === null || lifeB === null) {
        alert('Enter valid birth dates.');
        return;
    }

    const lifeDiff = Math.abs(lifeA - lifeB);
    const nameDiff = Math.abs(nameNumA - nameNumB);
    let score = 90 - (lifeDiff * 8) - (nameDiff * 4);
    score = Math.max(5, Math.min(98, Math.round(score)));

    const note = compatibilityNotes.find(n => lifeDiff <= n.maxDiff)?.text || compatibilityNotes[compatibilityNotes.length - 1].text;
    renderCompatibility({ score, lifeA, lifeB, nameNumA, nameNumB, note });
    trackEvent('numerology_compatibility', { score, life_diff: lifeDiff, name_diff: nameDiff });
}

function renderCompatibility(info) {
    const box = document.getElementById('compResult');
    const scoreEl = document.getElementById('compScore');
    const detailEl = document.getElementById('compDetail');
    if (!box || !scoreEl || !detailEl) return;

    scoreEl.innerText = `${info.score}%`;
    detailEl.innerText = `Life Paths ${info.lifeA} & ${info.lifeB}; Names ${info.nameNumA} & ${info.nameNumB}. ${info.note}`;
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth' });
}
