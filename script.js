/*
 * script.js
 * This file contains the JavaScript logic for our Upgraded Location-Based Greeting & Culture Helper web app.
 * It fetches the user's location, generates a greeting, provides a cultural tidbit, displays a country flag,
 * and manages dark mode functionality.
 */

// This function runs when the entire HTML document has been completely loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements where we will display information.
    const locationCityElement = document.getElementById('location-city');
    const locationCountryElement = document.getElementById('location-country');
    const greetingElement = document.getElementById('greeting');
    const cultureElement = document.getElementById('culture');
    const errorMessageElement = document.getElementById('error-message');
    const getInfoButton = document.getElementById('get-info-button');
    const countryFlagElement = document.getElementById('country-flag');

    // Dark Mode Toggle elements
    const darkModeToggle = document.getElementById('checkbox'); // The actual checkbox input
    const body = document.body; // The body element to apply the dark-mode class

    /**
     * Helper function to display an error message on the page.
     * @param {string} message - The error message to display.
     */
    function displayError(message) {
        errorMessageElement.textContent = `Error: ${message}`;
        errorMessageElement.style.display = 'block'; // Make the error message visible
        // Set all dynamic elements to an error state or clear them
        locationCityElement.textContent = 'City: N/A';
        locationCountryElement.textContent = 'Country: N/A';
        greetingElement.textContent = 'Greeting: Could not fetch.';
        cultureElement.textContent = 'Cultural Tidbit: Could not fetch.';
        countryFlagElement.style.display = 'none'; // Hide flag on error
        countryFlagElement.src = ''; // Clear flag source
    }

    /**
     * This object acts as our "HelloSalut API" simulator.
     * It maps country codes (ISO 3166-1 alpha-2) to common greetings in their primary language.
     * If a country is not listed, a default greeting will be used.
     */
    const greetingsByCountry = {
        'US': 'Hello!',
        'GB': 'Hello!',
        'CA': 'Hello! / Bonjour!',
        'FR': 'Bonjour!',
        'DE': 'Guten Tag!',
        'ES': '¡Hola!',
        'IT': 'Ciao!',
        'JP': 'Kon\'nichiwa!',
        'CN': 'Nǐ Hǎo!',
        'IN': 'Namaste!',
        'BR': 'Olá!',
        'AU': 'G\'day!',
        'MX': '¡Hola!',
        'RU': 'Privet!',
        'KR': 'Annyeonghaseyo!',
        'ZA': 'Sawubona!',
        'AE': 'Marhaba!',
        'SE': 'Hej!',
        'NL': 'Hallo!',
        'PT': 'Olá!',
        'GR': 'Yiasas!',
        'IE': 'Dia dhuit!',
        'NZ': 'Kia Ora!',
        'AR': '¡Hola!',
        'CH': 'Grüezi! / Bonjour! / Ciao!',
        'AT': 'Grüß Gott!',
        'BE': 'Hallo! / Bonjour!',
        'DK': 'Goddag!',
        'FI': 'Hei!',
        'NO': 'Hallo!',
        'PL': 'Cześć!',
        'TR': 'Merhaba!',
        'VN': 'Xin chào!',
        'TH': 'Sawasdee krab/ka!',
        'ID': 'Halo!',
        'PH': 'Kumusta!',
        'EG': 'Ahlan!',
        'SA': 'Salam alaikum!',
        'KE': 'Jambo!',
    };

    /**
     * This object serves as our "Culture Helper" simulator.
     * It provides a very brief, general cultural tidbit or fact per country code.
     */
    const culturalTidbitsByCountry = {
        'US': 'Tipping is customary for services like dining and taxis.',
        'GB': 'Queueing (lining up) is a deeply ingrained part of British etiquette.',
        'CA': 'Canadians are known for their politeness and love for ice hockey.',
        'FR': 'Greetings often involve a kiss on each cheek, depending on the region and relationship.',
        'DE': 'Punctuality is highly valued in German culture.',
        'ES': 'Lunch is often eaten later, around 2-3 PM, followed by a siesta in some regions.',
        'IT': 'Food and family are central to Italian culture; meal times are cherished.',
        'JP': 'Bowing is a common form of greeting and showing respect.',
        'CN': 'Family ties and respect for elders are cornerstones of Chinese culture.',
        'IN': 'The "Namaste" greeting is often accompanied by pressing palms together.',
        'BR': 'Brazilians are generally warm and expressive, often greeting with hugs and kisses.',
        'AU': 'Australians often use informal language and abbreviations, and value a laid-back attitude.',
        'MX': 'Mexicans are very family-oriented, and celebrations are often vibrant and communal.',
        'RU': 'Russians often prefer formal greetings initially and value close friendships deeply.',
        'KR': 'Respect for elders and hierarchical relationships are very important.',
        'ZA': 'South Africa is known as the "Rainbow Nation" due to its diverse cultures.',
        'AE': 'Hospitality is a key aspect of Emirati culture; guests are highly valued.',
        'SE': 'Lagom is a Swedish philosophy emphasizing "just enough" or balance.',
        'NL': 'Dutch culture often values directness and punctuality.',
        'PT': 'Portuguese meal times are important social occasions.',
        'GR': 'Greeks are known for their hospitality and strong sense of community.',
        'IE': 'Irish culture is rich in music, storytelling, and a strong sense of humor.',
        'NZ': 'Maori culture plays a significant role, with traditions like the Haka.',
        'AR': 'Argentine culture is heavily influenced by European traditions, especially from Italy and Spain.',
        'CH': 'Switzerland is known for its multilingualism and neutrality.',
        'AT': 'Austrian culture boasts rich traditions in music, art, and intellectual discourse.',
        'BE': 'Belgian culture is a blend of French and Dutch influences.',
        'DK': 'Hygge (pronounced "hoo-ga") is a Danish concept of coziness and contentment.',
        'FI': 'Sauna culture is deeply embedded in Finnish life, serving as a place for relaxation and contemplation.',
        'NO': 'Norwegians have a strong connection to nature and outdoor activities.',
        'PL': 'Polish culture emphasizes family, tradition, and hospitality.',
        'TR': 'Turkish hospitality is famous; guests are often offered tea and sweets.',
        'VN': 'Vietnamese culture emphasizes respect for ancestors and communal harmony.',
        'TH': 'The "wai" (pressing palms together) is a traditional Thai greeting and sign of respect.',
        'ID': 'Indonesian culture is incredibly diverse, with thousands of islands and ethnic groups.',
        'PH': 'Filipinos are known for their strong family ties and hospitality.',
        'EG': 'Egyptian culture is ancient and deeply spiritual, with strong emphasis on family.',
        'SA': 'Saudi culture is rooted in Islamic traditions, with strong emphasis on community and hospitality.',
        'KE': 'Kenyan culture is a blend of diverse ethnic traditions, with Swahili as a unifying language.',
    };

    /**
     * Fetches location data using ipapi.co, then determines and displays
     * a greeting, cultural tidbit, and country flag based on the location.
     */
    async function getLocationAndGreeting() {
        // Clear any previous error messages when a new request is made
        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';

        // Set loading states for UI elements
        locationCityElement.textContent = 'City: Loading...';
        locationCountryElement.textContent = 'Country: Loading...';
        greetingElement.textContent = 'Greeting: Loading...';
        cultureElement.textContent = 'Cultural Tidbit: Loading...';
        countryFlagElement.style.display = 'none'; // Hide flag while loading
        countryFlagElement.src = ''; // Clear old flag source

        try {
            // Step 1: Fetch location data from ipapi.co
            const ipapiResponse = await fetch('https://ipapi.co/json/');
            if (!ipapiResponse.ok) {
                // If the HTTP response is not ok, throw an error
                throw new Error(`HTTP error! Status: ${ipapiResponse.status} - ${ipapiResponse.statusText}`);
            }
            const locationData = await ipapiResponse.json();

            // Extract relevant information from the location data.
            const city = locationData.city || 'Unknown';
            const country = locationData.country_name || 'Unknown';
            // Default to 'US' if country code is missing to ensure a fallback for flags and data
            const countryCode = locationData.country_code ? locationData.country_code.toUpperCase() : 'US';

            // Display the fetched location details on the webpage.
            locationCityElement.textContent = `City: ${city}`;
            locationCountryElement.textContent = `Country: ${country}`;

            // Step 2: Display the country flag
            // Using flagcdn.com for flags. Format: /country_code.png
            countryFlagElement.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
            countryFlagElement.alt = `Flag of ${country}`;
            countryFlagElement.style.display = 'inline-block'; // Show the flag

            // Step 3: Determine greeting using our simulated "HelloSalut API"
            const greeting = greetingsByCountry[countryCode] || 'Hello!';
            greetingElement.textContent = `Greeting: ${greeting}`;

            // Step 4: Determine cultural tidbit using our simulated "Culture Helper"
            const culturalTidbit = culturalTidbitsByCountry[countryCode] || 'Explore the local customs and traditions to learn more!';
            cultureElement.textContent = `Cultural Tidbit: ${culturalTidbit}`;

        } catch (error) {
            console.error('Failed to fetch location or greeting:', error);
            // Provide a more user-friendly error message
            displayError(`Failed to load data. Please check your internet connection or try again later. Details: "${error.message}".`);
        }
    }

    /**
     * Toggles dark mode on or off.
     * Stores the preference in local storage.
     */
    function toggleDarkMode() {
        body.classList.toggle('dark-mode');
        // Save the current state to local storage
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    }

    // --- Event Listeners ---

    // Attach an event listener to the main "Get Info" button.
    getInfoButton.addEventListener('click', getLocationAndGreeting);

    // Attach an event listener to the dark mode toggle switch.
    darkModeToggle.addEventListener('change', toggleDarkMode);

    // --- Initializations ---

    // Check for saved dark mode preference when the page loads
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true; // Ensure the toggle switch reflects the state
    }
});