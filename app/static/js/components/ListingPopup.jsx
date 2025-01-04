// static/js/components/ListingPopup.jsx
const ListingPopup = ({ isOpen, onClose, images, metadata, onConfirm }) => {
    if (!isOpen || !metadata) return null;

    const [editedMetadata, setEditedMetadata] = React.useState({
        title: metadata.title || '',
        artist: metadata.artist || '',
        label: metadata.label || '',
        year: metadata.year || '',
        format: metadata.format || '',
        catno: metadata.catno || '',
        barcode: metadata.barcode || ''
    });

    // Add new state for tracking submission
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleChange = (field, value) => {
        setEditedMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleConfirm = () => {
        setIsSubmitting(true);
        onConfirm(editedMetadata);
    };
  
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>Review Listing</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <div className="image-carousel">
                    {images.map((image, index) => (
                        <div key={index} className="carousel-item">
                            <img src={image} alt={`Product image ${index + 1}`} />
                        </div>
                    ))}
                </div>

                <div className="listing-details">
                    <div className="input-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            value={editedMetadata.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Artist:</label>
                        <input
                            type="text"
                            value={editedMetadata.artist}
                            onChange={(e) => handleChange('artist', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Label:</label>
                        <input
                            type="text"
                            value={editedMetadata.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Year:</label>
                        <input
                            type="text"
                            value={editedMetadata.year}
                            onChange={(e) => handleChange('year', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Format:</label>
                        <input
                            type="text"
                            value={editedMetadata.format}
                            onChange={(e) => handleChange('format', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Catalog Number:</label>
                        <input
                            type="text"
                            value={editedMetadata.catno}
                            onChange={(e) => handleChange('catno', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Barcode:</label>
                        <input
                            type="text"
                            value={editedMetadata.barcode}
                            onChange={(e) => handleChange('barcode', e.target.value)}
                        />
                    </div>
                </div>

                <div className="popup-actions">
                    <button 
                        onClick={handleConfirm} 
                        className="confirm-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Searching...' : 'Search Discogs'}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="cancel-button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Make it available globally
window.ListingPopup = ListingPopup;