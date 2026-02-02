// Research pack helper: YouTube search via YouTube Data API v3
// Uses env var: GOOGLE_API_KEY
// This is a helper module (not a Clawdbot tool). Prefer the packaged tool:
//   starter-kit/packs/verticals/research/tools/youtube-search-api/tool.js

async function searchYouTubeVideos(query, { maxResults = 10 } = {}) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('type', 'video');
  url.searchParams.set('key', apiKey);

  const resp = await fetch(url);
  const data = await resp.json();
  if (!resp.ok || data?.error) {
    const msg = data?.error?.message || `HTTP ${resp.status}`;
    throw new Error(`YouTube API error: ${msg}`);
  }

  return (data.items || []).map((it) => {
    const videoId = it?.id?.videoId || null;
    return {
      title: it?.snippet?.title || null,
      channelTitle: it?.snippet?.channelTitle || null,
      publishedAt: it?.snippet?.publishedAt || null,
      description: it?.snippet?.description || null,
      videoId,
      url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    };
  });
}

module.exports = { searchYouTubeVideos };
