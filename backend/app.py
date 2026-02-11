from flask import Flask, request, jsonify
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import requests
import os
from deep_translator import GoogleTranslator
from flask_cors import CORS





app = Flask(__name__)
CORS(app)


# --- Configuration ---
# Public LibreTranslate instance. For production, consider self-hosting or using a dedicated API key.
LIBRETRANSLATE_API_URL = "https://translate.astian.org/translate"


# A simple mapping of common country codes to their primary language codes.
# This is not exhaustive and might not cover all regional variations or minority languages.
# For a more robust solution, a dedicated library or a comprehensive database would be needed.
COUNTRY_LANGUAGE_MAP = {
    "US": "en",  # United States - English
    "GB": "en",  # United Kingdom - English
    "CA": "en",  # Canada - English (can also be 'fr' for French-speaking regions)
    "AU": "en",  # Australia - English
    "DE": "de",  # Germany - German
    "FR": "fr",  # France - French
    "ES": "es",  # Spain - Spanish
    "IT": "it",  # Italy - Italian
    "JP": "ja",  # Japan - Japanese
    "CN": "zh",  # China - Chinese (Mandarin)
    "RU": "ru",  # Russia - Russian
    "BR": "pt",  # Brazil - Portuguese
    "PT": "pt",  # Portugal - Portuguese
    "MX": "es",  # Mexico - Spanish
    "AR": "es",  # Argentina - Spanish
    "IN": "hi",  # India - Hindi (many other official languages exist)
    "KR": "ko",  # South Korea - Korean
    "NL": "nl",  # Netherlands - Dutch
    "SE": "sv",  # Sweden - Swedish
    "NO": "no",  # Norway - Norwegian
    "DK": "da",  # Denmark - Danish
    "FI": "fi",  # Finland - Finnish
    "GR": "el",  # Greece - Greek
    "TR": "tr",  # Turkey - Turkish
    "EG": "ar",  # Egypt - Arabic
    "SA": "ar",  # Saudi Arabia - Arabic
    "TH": "th",  # Thailand - Thai
    "VN": "vi",  # Vietnam - Vietnamese
    "ID": "id",  # Indonesia - Indonesian
    "PH": "tl",  # Philippines - Tagalog (Filipino)
    "ZA": "en",  # South Africa - English (many other official languages)
    "KE": "sw",  # Kenya - Swahili (also English)
    "NG": "en",  # Nigeria - English (many other official languages)
}

# Initialize the Nominatim geocoder
# It's good practice to provide a unique user_agent for your application.
geolocator = Nominatim(user_agent="globe-flask-backend")

def get_country_and_language(latitude, longitude):
    """
    Reverse geocodes the given coordinates to determine the country and its primary language.

    Args:
        latitude (float): The latitude coordinate.
        longitude (float): The longitude coordinate.

    Returns:
        tuple: A tuple containing (country_name, country_code, language_code)
               or (None, None, None) if identification fails.
    """
    try:
        location = geolocator.reverse((latitude, longitude), exactly_one=True, language="en")
        if location and location.address:
            address = location.raw.get('address', {})
            country = address.get('country')
            country_code = address.get('country_code', '').upper()
            language_code = COUNTRY_LANGUAGE_MAP.get(country_code, "en") # Default to English
            return country, country_code, language_code
    except GeocoderTimedOut:
        print(f"Geocoding service timed out for {latitude}, {longitude}")
    except GeocoderServiceError as e:
        print(f"Geocoding service error: {e} for {latitude}, {longitude}")
    except Exception as e:
        print(f"An unexpected error occurred during geocoding: {e}")
    return None, None, "en" # Default to English if anything goes wrong

def translate_text(text, target_language):
    try:
        translated = GoogleTranslator(
            source='auto',
            target=target_language
        ).translate(text)

        return translated

    except Exception as e:
        print("Translation error:", e)
        return text



@app.route('/greet', methods=['GET'])
def greet():
    """
    GET /greet?lat=<latitude>&lon=<longitude>
    Accepts latitude and longitude, determines the country and local language,
    translates "Hello" into that language, and returns a JSON response.
    """
    # 1. Get latitude and longitude from query parameters
    lat_str = request.args.get('lat')
    lon_str = request.args.get('lon')

    if not lat_str or not lon_str:
        return jsonify({
            "error": "Missing latitude or longitude parameters.",
            "example": "/greet?lat=34.0522&lon=-118.2437"
        }), 400

    try:
        latitude = float(lat_str)
        longitude = float(lon_str)
    except ValueError:
        return jsonify({
            "error": "Invalid latitude or longitude format. Must be numeric.",
            "received_lat": lat_str,
            "received_lon": lon_str
        }), 400

    # 2. Determine country and language
    country_name, country_code, language_code = get_country_and_language(latitude, longitude)

    if not country_name:
        # Even if country isn't found, we default language_code to 'en' in get_country_and_language
        translated_greeting = translate_text("Hello", language_code)
        return jsonify({
            "message": translated_greeting,
            "original_text": "Hello",
            "country": "Unknown",
            "country_code": "Unknown",
            "language_code": language_code,
            "info": "Could not determine country for the given coordinates, defaulting to English translation."
        }), 200

    # 3. Translate "Hello" into the local language
    translated_greeting = translate_text("Hello", language_code)

    # 4. Return JSON response
    return jsonify({
        "message": translated_greeting,
        "original_text": "Hello",
        "country": country_name,
        "country_code": country_code,
        "language_code": language_code
    }), 200

if __name__ == '__main__':
    # When running directly, start the Flask development server.
    # In a production environment, you would typically use a production-ready WSGI server
    # like Gunicorn or uWSGI.
    print("Starting Flask app. Access the API at http://127.0.0.1:5000/greet?lat=<latitude>&lon=<longitude>")
    app.run(debug=True) # debug=True enables reloader and debugger
