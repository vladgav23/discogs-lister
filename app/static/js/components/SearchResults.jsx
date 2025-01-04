// Ensure React is available
if (typeof React === 'undefined') {
    throw new Error('React must be loaded before SearchResults component');
}

class SearchResults extends React.Component {
    render() {
        const { results, onClose } = this.props;
        
        // Enhanced debug logging
        console.log('SearchResults component rendered with:', {
            results: results,
            hasResults: !!results,
            resultsArray: results?.results,
            success: results?.success
        });
        
        // Handle case where results is undefined
        if (!results) {
            console.log('No results provided to SearchResults');
            return (
                <div className="search-results-popup">
                    <div className="search-results-content">
                        <h2>Discogs Search Results</h2>
                        <p>Error: No results received</p>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }

        // Get the search results array, defaulting to empty array if not present
        const searchResults = results.results || [];
        console.log('Processed search results:', searchResults);

        return (
            <div className="search-results-popup">
                <div className="search-results-content">
                    <h2>Discogs Search Results</h2>
                    <div className="results-list">
                        {!results.success ? (
                            <p>Error: {results.message || 'Failed to fetch results'}</p>
                        ) : searchResults.length === 0 ? (
                            <p>No results found</p>
                        ) : (
                            searchResults.map((result, index) => (
                                <div key={index} className="result-item">
                                    <img src={result.thumb || ''} alt={result.title} />
                                    <div className="result-details">
                                        <h3>{result.title}</h3>
                                        <p>{result.year}</p>
                                        <p>{result.label}</p>
                                        <a href={`https://www.discogs.com${result.uri}`} 
                                           target="_blank" 
                                           rel="noopener noreferrer">
                                            View on Discogs
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }
}

// Register component globally
if (typeof window !== 'undefined') {
    window.SearchResults = SearchResults;
    console.log('SearchResults component registered globally');
} 