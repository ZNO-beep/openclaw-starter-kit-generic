# YouTube Search API Tool

## Overview
This tool allows Openclaw agents to search for YouTube videos based on specified queries.

### Implementation Steps
1. **API Key**: Obtain a valid YouTube Data API key and ensure it is set in environment variables.
2. **Usage**: Call `searchYouTubeVideos(query)` to fetch relevant video results.

### Example Usage
```javascript
const videos = await searchYouTubeVideos('Openclaw setup guide');
console.log(videos);
```

### Considerations
- Ensure the `node-fetch` package is installed.
- Monitor API usage to avoid hitting quota limits.

### Change Log
- **Date**: YYYY-MM-DD  
- **Description**: Initial implementation of YouTube Search API tool documentation.