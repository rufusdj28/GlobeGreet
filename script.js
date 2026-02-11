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
    const speakBtn = document.getElementById('speak-btn');

    const darkModeToggle = document.getElementById('checkbox');
    const body = document.body;

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

        landmarkElement.textContent = "";
        landmarkImg.style.display = "none";
        landmarkImg.src = "";

        try {

            // Get location
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

            // Call LIVE backend
            const greetRes = await fetch(
                `https://globegreet-backend.onrender.com/greet?lat=${loc.latitude}&lon=${loc.longitude}`
            );

            const greetData = await greetRes.json();
            greetingElement.textContent = greetData.message;

            // Wikipedia info
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

    getInfoButton.addEventListener('click', getLocationAndGreeting);

    // -----------------------------
    // DARK MODE
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

    // -----------------------------
    // TEXT TO SPEECH
    // -----------------------------
    if (speakBtn) {

        let voices = [];

        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
        };

        speakBtn.addEventListener("click", () => {

            const text = greetingElement.textContent.trim();

            if (!text) {
                alert("Greeting not ready yet!");
                return;
            }

            if (!('speechSynthesis' in window)) {
                alert("Speech not supported");
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);

            if (voices.length > 0) {
                utterance.voice =
                    voices.find(v => v.lang.startsWith("en")) ||
                    voices[0];
            }

            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        });
    }

});
