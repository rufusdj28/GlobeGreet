document.addEventListener('DOMContentLoaded', () => {

    const locationCityElement = document.getElementById('location-city');
    const locationCountryElement = document.getElementById('location-country');
    const greetingElement = document.getElementById('greeting');
    const cultureElement = document.getElementById('culture');
    const landmarkElement = document.getElementById('landmark-text');
    const landmarkImg = document.getElementById('landmark-img');
    const errorMessageElement = document.getElementById('error-message');
    const getInfoButton = document.getElementById('get-info-button');
    const countryFlagElement = document.getElementById('country-flag');

    const darkModeToggle = document.getElementById('checkbox');
    const body = document.body;
    const speakBtn = document.getElementById('speak-btn');


    // -----------------------------
    // Error display helper
    // -----------------------------
    function displayError(msg) {
        errorMessageElement.textContent = msg;
        errorMessageElement.style.display = "block";
    }

    // -----------------------------
    // Wikipedia fetch
    // -----------------------------
    async function getWikiData(city) {
        try {
            const res = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
            );
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    // -----------------------------
    // MAIN FUNCTION
    // -----------------------------
    async function getLocationAndGreeting() {

        errorMessageElement.style.display = "none";

        // Reset UI
        landmarkElement.textContent = "";
        landmarkImg.style.display = "none";
        landmarkImg.src = "";

        try {

            // 1️⃣ Get location
            const response = await fetch("https://ipapi.co/json/");
            const loc = await response.json();

            const city = loc.city;
            const country = loc.country_name;
            const code = loc.country_code;

            locationCityElement.textContent = `City: ${city}`;
            locationCountryElement.textContent = `Country: ${country}`;

            countryFlagElement.src =
                `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
            countryFlagElement.style.display = "inline-block";

            // 2️⃣ Call LIVE backend on Render
            const greetRes = await fetch(
                `https://globegreet-backend.onrender.com/greet?lat=${loc.latitude}&lon=${loc.longitude}`
            );

            const greetData = await greetRes.json();
            greetingElement.textContent = greetData.message;

            // 3️⃣ Wikipedia culture + landmark
            const wiki = await getWikiData(city);

            if (wiki) {
                cultureElement.textContent =
                    wiki.extract || `You're in ${city}. Explore!`;

                landmarkElement.textContent =
                    `Famous place: ${wiki.title}`;

                if (wiki.thumbnail) {
                    landmarkImg.src = wiki.thumbnail.source;
                    landmarkImg.style.display = "block";
                }
            } else {
                cultureElement.textContent =
                    `You're in ${city}. Explore local culture!`;
            }

        } catch (err) {
            displayError("Failed to fetch location or backend data");
        }
    }

    // Button click
    getInfoButton.addEventListener('click', getLocationAndGreeting);

    // -----------------------------
    // Dark Mode
    // -----------------------------
    if (darkModeToggle) {

        darkModeToggle.addEventListener('change', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem(
                'darkMode',
                body.classList.contains('dark-mode')
            );
        });

        if (localStorage.getItem('darkMode') === 'true') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    }

});

// -----------------------------
// TEXT TO SPEECH
// -----------------------------
speakBtn.addEventListener("click", () => {

    const text = greetingElement.textContent;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to match language
    utterance.lang = navigator.language || "en-US";

    speechSynthesis.speak(utterance);
});
