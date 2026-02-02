#!/usr/bin/env node
/*
  youtube_search tool (implementation)
  - Reads API key from env var specified in config.json (default: GOOGLE_API_KEY)
  - Outputs high-signal JSON for agent consumption

  Examples:
    node tool.js --query "OpenClaw" --published-today
    node tool.js --query "OpenClaw" --publishedAfter "2026-02-01T00:00:00Z" --maxResults 10
*/

const fs = require('fs');
const path = require('path');
// Node 18+ provides global fetch; no dependency required.
const fetch = global.fetch;
if (typeof fetch !== 'function') {
  console.error('youtube_search error: global fetch is not available in this Node runtime');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function toInt(v, dflt) {
  if (v === undefined) return dflt;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : dflt;
}

function isRfc3339(s) {
  // loose check
  return typeof s === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/.test(s);
}

function utcStartOfTodayISO() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  return start.toISOString();
}

async function main() {
  const args = parseArgs(process.argv);

  const configPath = path.join(__dirname, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const query = args.query || args.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    console.error('youtube_search error: missing required --query');
    process.exit(1);
  }

  const maxResults = Math.min(
    Math.max(toInt(args.maxResults, config.defaultMaxResults || 10), 1),
    config.maxMaxResults || 25
  );

  // Pagination controls: maxResults is per-page size.
  const pages = Math.min(Math.max(toInt(args.pages, config.defaultPages || 2), 1), config.maxPages || 10);
  const maxTotal = Math.min(Math.max(toInt(args.maxTotal, config.defaultMaxTotal || 50), 1), config.maxMaxTotal || 500);

  const order = (args.order || config.defaultOrder || 'date');
  const safeSearch = (args.safeSearch || config.defaultSafeSearch || 'none');
  const publishedAfter = args['published-today'] ? utcStartOfTodayISO() : args.publishedAfter;
  const publishedBefore = args.publishedBefore;

  if (publishedAfter && !isRfc3339(publishedAfter)) {
    console.error('youtube_search error: --publishedAfter must be RFC3339 like 2026-02-01T00:00:00Z');
    process.exit(1);
  }
  if (publishedBefore && !isRfc3339(publishedBefore)) {
    console.error('youtube_search error: --publishedBefore must be RFC3339 like 2026-02-02T00:00:00Z');
    process.exit(1);
  }

  const apiKeyEnv = config.apiKeyEnv || 'GOOGLE_API_KEY';
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) {
    console.error(`youtube_search error: missing API key env var ${apiKeyEnv}`);
    process.exit(1);
  }

  const baseUrl = config.baseUrl || 'https://www.googleapis.com/youtube/v3';
  const allResults = [];
  let nextPageToken = null;
  let rawItemsFetched = 0;

  for (let page = 1; page <= pages; page++) {
    const url = new URL(baseUrl + '/search');
    url.searchParams.set('part', config.part || 'snippet');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('type', config.defaultType || 'video');
    url.searchParams.set('order', order);
    url.searchParams.set('safeSearch', safeSearch);
    if (publishedAfter) url.searchParams.set('publishedAfter', publishedAfter);
    if (publishedBefore) url.searchParams.set('publishedBefore', publishedBefore);
    if (nextPageToken) url.searchParams.set('pageToken', nextPageToken);
    url.searchParams.set('key', apiKey);

    const resp = await fetch(url.toString());
    const data = await resp.json();

    if (data?.error) {
      console.error(JSON.stringify({ tool: 'youtube_search', ok: false, error: data.error }, null, 2));
      process.exit(2);
    }

    const items = Array.isArray(data.items) ? data.items : [];
    rawItemsFetched += items.length;

    for (const it of items) {
      if (allResults.length >= maxTotal) break;
      const videoId = it?.id?.videoId || null;
      allResults.push({
        title: it?.snippet?.title || null,
        channelTitle: it?.snippet?.channelTitle || null,
        publishedAt: it?.snippet?.publishedAt || null,
        description: it?.snippet?.description || null,
        videoId,
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
      });
    }

    nextPageToken = data.nextPageToken || null;
    if (!nextPageToken) break;
    if (allResults.length >= maxTotal) break;
  }

  const out = {
    tool: 'youtube_search',
    ok: true,
    query,
    maxResultsPerPage: maxResults,
    pagesRequested: pages,
    maxTotal,
    order,
    safeSearch,
    publishedAfter: publishedAfter || null,
    publishedBefore: publishedBefore || null,
    rawItemsFetched,
    countReturned: allResults.length,
    results: allResults,
  };

  process.stdout.write(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ tool: 'youtube_search', ok: false, error: String(err) }, null, 2));
  process.exit(3);
});
