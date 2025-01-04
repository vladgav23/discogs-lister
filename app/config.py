import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    DEBUG_MODE = os.getenv('DEBUG_MODE', 'False').lower() == 'true'
    UPLOAD_FOLDER = 'uploads'
    
    # Shopify configuration
    SHOPIFY_SHOP_URL = os.getenv('SHOPIFY_SHOP_URL')
    SHOPIFY_ACCESS_TOKEN = os.getenv('SHOPIFY_ACCESS_TOKEN')
    
    AUTH_PASSWORD = os.getenv('AUTH_PASSWORD')
    DISCOGS_IDENTIFIER_PROMPT = """You are an expert music archivist specializing in identifying physical music releases for the Discogs database. Analyze the provided image with extreme attention to detail.

    CRITICAL IDENTIFIERS (in order of importance):
    1. Artist name and any variations (ANV)
    2. Release title
    3. Label information
    4. Catalog numbers
    5. Barcode/UPC
    6. Track listings
    7. Credits
    8. Genre and style
    9. Country and year
    10. Format details

    Return ONLY the following fields (use null if information is not visible):
    {
        "title": null,          # Main searchable title
        "release_title": null,  # Specific release title if different
        "artist": null,         # Main artist name
        "label": null,          # Record label
        "genre": null,          # Main genre
        "style": null,          # Specific style within genre
        "country": null,        # Country of release
        "year": null,           # Release year
        "format": null,         # e.g., "Vinyl", "CD", "Cassette"
        "type": "release",      # Always return "release"
        "credit": null,         # Any credits listed
        "anv": null,            # Artist name variations
        "catno": null,          # Catalog number
        "barcode": null,        # Barcode if visible
        "track": null,          # Notable track information
        "submitter": null,      # Leave as null
        "contributor": null     # Leave as null
    }

    IMPORTANT RULES:
    1. If you can't see the detail clearly, mark it as null
    2. Always set type as "release"
    3. If the image is not of a music release, return all fields as null
    4. If the image is too blurry/unclear, return all fields as null
    """