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

    // -----------------------------
    // Greeting fallback dictionary
    // -----------------------------
    const greetingsByCountry = {
        'IN': 'Namaste!',
        'US': 'Hello!',
        'FR': 'Bonjour!',
        'DE': 'Guten Tag!',
        'JP': 'Konnichiwa!',
        'ES': 'Hola!'
    };

    function displayError(msg) {
        errorMessageElement.textContent = msg;
        errorMessageElement.style.display = "block";
    }

    // -----------------------------
    // Wikipedia City Description
    // -----------------------------
    async function getCityInfo(city) {
        try {
            const res = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
            );
            if (!res.ok) return null;
            const data = await res.json();
            return data.extract;
        } catch {
            return null;
        }
    }

    // -----------------------------
    // Landmark + Image
    // -----------------------------
    async function getLandmark(city) {
        try {
            const res = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${city}`
            );
            if (!res.ok) return null;
            const data = await res.json();

            return {
                title: data.title,
                image: data.thumbnail ? data.thumbnail.source : null
            };
        } catch {
            return null;
        }
    }

    // -----------------------------
    // MAIN FUNCTION
    // -----------------------------
    async function getLocationAndGreeting() {

        errorMessageElement.style.display = "none";
        landmarkImg.style.display = "none";

        try {
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

            const greeting = greetingsByCountry[code] || "Hello!";
            greetingElement.textContent = greeting;

            // City description
            const desc = await getCityInfo(city);
            cultureElement.textContent =
                desc || `You're in ${city}. Explore local culture!`;

            // Landmark
            const landmark = await getLandmark(city);
            if (landmark) {
                landmarkElement.textContent =
                    `Famous place: ${landmark.title}`;

                if (landmark.image) {
                    landmarkImg.src = landmark.image;
                    landmarkImg.style.display = "block";
                }
            }

        } catch (err) {
            displayError("Failed to fetch location data");
        }
    }

    getInfoButton.addEventListener('click', getLocationAndGreeting);

    // -----------------------------
    // Dark Mode
    // -----------------------------
    darkModeToggle.addEventListener('change', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode',
            body.classList.contains('dark-mode'));
    });

    if (localStorage.getItem('darkMode') === 'true') {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

});
