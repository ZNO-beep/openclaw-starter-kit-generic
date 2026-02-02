#!/usr/bin/env node
/*
  youtube_transcript tool (Supadata)

  Uses Supadata API:
    GET /v1/transcript?url=...&mode=auto|native|generate&lang=en
    If transcript is too large, returns a jobId; fetch via GET /v1/transcript/{jobId}

  Auth:
    x-api-key: $SUPADATA_API_KEY

  Examples:
    node tool.js --url "https://www.youtube.com/watch?v=V6Mp0fUh-OM" --mode auto
    node tool.js --videoId "V6Mp0fUh-OM" --lang en
*/

const fs = require('fs');
const path = require('path');

const fetch = global.fetch;
if (typeof fetch !== 'function') {
  console.error('youtube_transcript error: global fetch is not available in this Node runtime');
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

function youtubeUrlFromVideoId(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

async function httpJson(url, apiKey) {
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
    },
  });
  const data = await resp.json().catch(() => null);
  return { status: resp.status, data };
}

async function main() {
  const args = parseArgs(process.argv);

  const configPath = path.join(__dirname, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const apiKeyEnv = config.apiKeyEnv || 'SUPADATA_API_KEY';
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) {
    console.error(`youtube_transcript error: missing API key env var ${apiKeyEnv}`);
    process.exit(1);
  }

  const videoId = args.videoId;
  const urlArg = args.url;
  const url = urlArg || (videoId ? youtubeUrlFromVideoId(videoId) : null);
  if (!url) {
    console.error('youtube_transcript error: provide --url or --videoId');
    process.exit(1);
  }

  const mode = args.mode || config.defaultMode || 'auto'; // auto|native|generate
  const lang = args.lang || args.language;

  const baseUrl = (config.baseUrl || 'https://api.supadata.ai/v1').replace(/\/$/, '');

  const turl = new URL(baseUrl + (config.endpoint || '/transcript'));
  turl.searchParams.set('url', url);
  if (mode) turl.searchParams.set('mode', mode);
  if (lang) turl.searchParams.set('lang', lang);

  let { status, data } = await httpJson(turl.toString(), apiKey);

  // If the API returns a jobId for async processing, poll once for now.
  if (data && (data.jobId || data.id) && !data.transcript && !data.text) {
    const jobId = data.jobId || data.id;
    const jobPath = (config.jobEndpoint || '/transcript/{jobId}').replace('{jobId}', encodeURIComponent(jobId));
    const jurl = baseUrl + jobPath;
    ({ status, data } = await httpJson(jurl, apiKey));
  }

  if (!data) {
    console.error(JSON.stringify({ tool: 'youtube_transcript', ok: false, error: 'No JSON response', status }, null, 2));
    process.exit(2);
  }

  if (data.error) {
    process.stdout.write(JSON.stringify({ tool: 'youtube_transcript', ok: false, error: data, status }, null, 2));
    process.exit(3);
  }

  // Supadata shapes vary by endpoint; normalize a couple common fields.
  const transcript = data.transcript || data.text || data.content || null;
  const segments = data.segments || data.items || null;

  // Best-effort plain text output for agent consumption.
  let transcriptText = null;
  if (typeof transcript === 'string') {
    transcriptText = transcript;
  } else if (Array.isArray(transcript)) {
    // Common Supadata format: [{text, offset, duration, lang}, ...]
    transcriptText = transcript
      .map((s) => (typeof s?.text === 'string' ? s.text.trim() : ''))
      .filter(Boolean)
      .join(' ');
  } else if (Array.isArray(segments)) {
    transcriptText = segments
      .map((s) => (typeof s?.text === 'string' ? s.text.trim() : ''))
      .filter(Boolean)
      .join(' ');
  }

  const out = {
    tool: 'youtube_transcript',
    ok: true,
    url,
    videoId: videoId || data.id || null,
    mode,
    lang: lang || data.lang || null,
    transcript,
    transcriptText,
    segments,
    raw: data,
  };

  process.stdout.write(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ tool: 'youtube_transcript', ok: false, error: String(err) }, null, 2));
  process.exit(99);
});
