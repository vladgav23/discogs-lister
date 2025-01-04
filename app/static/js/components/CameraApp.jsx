if (!window.SearchResults) {
    console.error('SearchResults component not found!');
}

const CameraApp = {
    handleUploadAndNext: async (capturedPhotos, showStatus, updateThumbnails, updatePhotoCount) => {
        if (capturedPhotos.length === 0) {
            showStatus('Take photos first');
            return;
        }

        showStatus('Generating listing details...', 999999);

        try {
            const metadataResponse = await fetch('/generate-metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: capturedPhotos
                }),
            });

            const metadataResult = await metadataResponse.json();

            if (!metadataResult.success) {
                throw new Error(metadataResult.message);
            }

            const croppedImages = metadataResult.cropped_images;

            const popupRoot = document.getElementById('popup-root');
            
            ReactDOM.render(
                <ListingPopup
                    isOpen={true}
                    images={croppedImages}
                    metadata={metadataResult.metadata}
                    onClose={() => {
                        ReactDOM.unmountComponentAtNode(popupRoot);
                        status.style.display = 'none';
                    }}
                    onConfirm={async (editedMetadata) => {
                        showStatus('Searching Discogs...', 999999);
                        try {
                            const searchResponse = await fetch('/search-discogs', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    metadata: editedMetadata
                                }),
                            });

                            const searchResult = await searchResponse.json();

                            if (searchResult.success) {
                                showStatus('Search completed successfully!');
                                capturedPhotos.length = 0;
                                updateThumbnails();
                                updatePhotoCount();
                                ReactDOM.unmountComponentAtNode(popupRoot);
                                
                                try {
                                    const SearchResultsComponent = window.SearchResults;
                                    if (!SearchResultsComponent) {
                                        console.error('SearchResults component not found in window object');
                                        throw new Error('SearchResults component not available');
                                    }

                                    const element = React.createElement(SearchResultsComponent, {
                                        results: searchResult,
                                        onClose: () => {
                                            ReactDOM.unmountComponentAtNode(popupRoot);
                                            status.style.display = 'none';
                                        }
                                    });

                                    ReactDOM.render(element, popupRoot);
                                } catch (error) {
                                    console.error('Error rendering SearchResults:', error);
                                    showStatus('Error rendering results: ' + error.message);
                                }
                            } else {
                                throw new Error(searchResult.message);
                            }
                        } catch (error) {
                            showStatus('Error searching Discogs: ' + error.message);
                        }
                    }}
                />,
                popupRoot
            );

        } catch (error) {
            showStatus('Error: ' + error.message);
        }
    }
};

window.CameraApp = CameraApp; 