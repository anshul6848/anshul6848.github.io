(function() {
    // Check if user already accepted
    if (localStorage.getItem('cookieConsent') === 'true') return;

    // Create Banner
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #fff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        border: 1px solid rgba(139, 92, 246, 0.2);
        max-width: 400px;
        font-family: 'Poppins', sans-serif;
    `;

    banner.innerHTML = `
        <div style="font-size: 0.9rem; color: #4b5563;">
            <strong>We use cookies 🍪</strong><br>
            We use cookies to analyze traffic and show personalized ads (Google AdSense). By continuing, you agree to our use of cookies.
        </div>
        <div style="display: flex; gap: 10px; width: 100%;">
            <button id="acceptCookies" style="
                background: linear-gradient(135deg, #7c3aed, #d946ef);
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                flex: 1;
            ">Accept</button>
            <a href="/privacy.html" style="
                border: 1px solid #ddd;
                background: white;
                color: #555;
                padding: 8px 20px;
                border-radius: 8px;
                text-decoration: none;
                text-align: center;
                font-size: 0.9rem;
            ">Policy</a>
        </div>
    `;

    document.body.appendChild(banner);

    // Handle Click
    document.getElementById('acceptCookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'true');
        banner.style.display = 'none';
        banner.remove();
    });
})();
