from pydantic import BaseModel
import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import logging
from app.config import Config

logger = logging.getLogger(__name__)


class ListingMetadata(BaseModel):
    # Basic fields
    title: str | None = None
    artist: str | None = None
    label: str | None = None
    year: str | None = None
    format: str | None = None
    catno: str | None = None  # Catalog Number
    barcode: str | None = None


class Listing:
    def __init__(self, openai_client):
        self.client = openai_client
        logger.debug("Initialized new Listing instance")

    @classmethod
    def from_base64_list(cls, base64_images, openai_client):
        logger.debug(f"Creating Listing from {len(base64_images)} base64 images")
        instance = cls(openai_client)
        instance.images = cls._prepare_base64_images(base64_images)
        logger.debug("Finished preparing base64 images")
        return instance

    @staticmethod
    def _prepare_base64_images(base64_images):
        logger.debug("Starting base64 image preparation")
        images = []
        for i, img_data in enumerate(base64_images):
            logger.debug(f"Processing base64 image {i+1}")
            # Ensure the image data has the proper data URL format
            if not img_data.startswith('data:image'):
                img_data = f'data:image/jpeg;base64,{img_data}'

            images.append({
                "type": "image_url",
                "image_url": {
                    "url": img_data
                }
            })
        logger.debug(f"Prepared {len(images)} images")
        return images

    def get_metadata(self):
        logger.debug("Getting metadata from OpenAI")
        messages = [
            {"role": "system", "content": Config.DISCOGS_IDENTIFIER_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text":"Please analyze these images and return the metadata for the items shown."},
                *self.images
            ]}
        ]

        logger.debug("Sending request to OpenAI")
        completion = self.client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=messages,
            response_format=ListingMetadata,
            temperature=0
        )
        logger.debug("Received response from OpenAI")

        return completion.choices[0].message.parsed


if __name__ == "__main__":
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    client = OpenAI(api_key=api_key)

    # Process all folders in data directory
    data_folders = [d for d in Path("data").iterdir() if d.is_dir()]

    for folder in data_folders:
        try:
            listing = Listing.from_directory(str(folder), client)
            print(f"\n=== {folder.name} ===")
            print(listing.get_metadata())
        except Exception as e:
            print(f"Error processing {folder.name}: {e}")