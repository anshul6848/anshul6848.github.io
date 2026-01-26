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

function calculateNumerology() {
    const name = document.getElementById('nameInput').value.toUpperCase().trim();
    
    if (!name) {
        alert("Please enter a name");
        return;
    }

    let total = 0;
    
    // Sum up the letters
    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (chaldeanTable[char]) {
            total += chaldeanTable[char];
        }
    }
    
    if (total === 0) {
        alert("Please enter a valid name using letters.");
        return;
    }

    // Reduce to single digit (unless master number, but for MVP keep it simple 1-9)
    let reduced = reduceNumber(total);

    // Show Result
    const resultDiv = document.getElementById('result');
    document.getElementById('destinyNumber').innerText = reduced;
    document.getElementById('destinyMeaning').innerText = numberMeanings[reduced];
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({behavior: 'smooth'});
}

function reduceNumber(num) {
    while (num > 9) {
        num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return num;
}
