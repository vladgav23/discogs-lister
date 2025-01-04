import base64
from PIL import Image
import io
from ..utils.logger import setup_logger
from app.list import Listing
from app.config import Config
import discogs_client
import os

logger = setup_logger()

class ImageService:
    def __init__(self, openai_client, discog_client):
        self.openai_client = openai_client
        self.discogs_client = discog_client

    def process_image(self, image_data):
        """Process a single image to crop it to square"""
        # Remove the data URL prefix if present
        if 'base64,' in image_data:
            base64_data = image_data.split('base64,')[1]
        else:
            base64_data = image_data

        # Decode base64 to image
        image_bytes = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_bytes))

        # Calculate dimensions for square crop
        width, height = image.size
        size = min(width, height)
        
        # Calculate coordinates for center crop
        left = (width - size) // 2
        top = (height - size) // 2
        right = left + size
        bottom = top + size

        # Crop the image
        cropped_image = image.crop((left, top, right, bottom))

        # Convert back to base64
        img_byte_arr = io.BytesIO()
        cropped_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        return base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

    def generate_metadata(self, images):
        """Generate metadata using OpenAI"""
        if not images:
            raise ValueError("No images provided")

        logger.debug("Processing images")
        # Crop images before sending to OpenAI
        cropped_images = [f"data:image/jpeg;base64,{self.process_image(img)}" for img in images]
        
        logger.debug("Generating metadata using OpenAI")
        listing = Listing.from_base64_list(cropped_images, self.openai_client)
        return listing.get_metadata()
    
    def search_discogs(self, metadata):
        """Search Discogs API with the provided metadata and return top 5 matches"""
        logger.debug(f"Searching Discogs with metadata: {metadata}")
        
        try:
            # Build search params from ListingMetadata fields, excluding None values
            search_params = {
                'type': 'release',
                **{k: v for k, v in metadata.items() if v is not None}
            }

            # Search using available fields
            results = self.discogs_client.search(**search_params)
            
            # Get first 5 results using pagination
            top_results = []
            page = results.page(1)  # Get first page
            count = 0
            
            for result in page:
                if count >= 5:  # Only get first 5 results
                    break
                    
                result_data = {
                    'id': result.id,
                    'title': result.title,
                    'year': result.year,
                    'label': result.labels[0].name if result.labels else None,
                    'format': result.formats[0]['name'] if result.formats else None,
                    'thumb': result.thumb,
                    'catno': result.labels[0].catno if result.labels else None,
                    'country': result.country,
                    'genre': result.genres[0] if result.genres else None
                }
                top_results.append(result_data)
                count += 1
                
            logger.debug(f"Found {len(top_results)} results from Discogs")
            return {
                'success': True,
                'results': top_results
            }
                
        except Exception as e:
            logger.error(f"Error searching Discogs: {str(e)}", exc_info=True)
            return {
                'success': False,
                'message': f'Error searching Discogs: {str(e)}'
            }