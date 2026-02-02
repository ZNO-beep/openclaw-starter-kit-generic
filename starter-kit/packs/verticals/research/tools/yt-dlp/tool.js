#!/usr/bin/env node
/*
  yt_dlp tool wrapper

  Safe-by-default: skips media download unless explicitly enabled.

  Commands:
    --mode metadata   (default) -> prints high-signal JSON metadata
    --mode list-subs  -> lists available subtitles
    --mode get-subs   -> downloads subtitles (still skips media download)

  Examples:
    node tool.js --url "https://www.youtube.com/watch?v=V6Mp0fUh-OM" --mode metadata
    node tool.js --videoId V6Mp0fUh-OM --mode list-subs
    node tool.js --videoId V6Mp0fUh-OM --mode get-subs --langs en --outDir /tmp/subs
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function run(bin, argv) {
  const r = spawnSync(bin, argv, { encoding: 'utf8' });
  return { code: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function die(obj, code = 2) {
  process.stdout.write(JSON.stringify(obj, null, 2));
  process.exit(code);
}

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

async function main() {
  const args = parseArgs(process.argv);
  const configPath = path.join(__dirname, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const bin = config.binary || 'yt-dlp';
  const videoId = args.videoId;
  const url = args.url || (videoId ? youtubeUrlFromVideoId(videoId) : null);
  if (!url) {
    die({ tool: 'yt_dlp', ok: false, error: 'Provide --url or --videoId' }, 1);
  }

  const mode = args.mode || 'metadata'; // metadata|list-subs|get-subs

  // Safety defaults
  const skipDownload = args.download ? false : (config.defaultSkipDownload !== false);

  if (mode === 'metadata') {
    const ytArgs = ['-J'];
    if (skipDownload) ytArgs.push('--skip-download');
    ytArgs.push(url);

    const r = run(bin, ytArgs);
    if (r.code !== 0) {
      die({ tool: 'yt_dlp', ok: false, mode, url, error: 'yt-dlp failed', stderr: r.stderr.trim() });
    }

    const data = safeJsonParse(r.stdout);
    if (!data) {
      die({ tool: 'yt_dlp', ok: false, mode, url, error: 'Could not parse JSON output' });
    }

    const out = {
      tool: 'yt_dlp',
      ok: true,
      mode,
      url,
      id: data.id || null,
      title: data.title || null,
      uploader: data.uploader || null,
      channel: data.channel || null,
      upload_date: data.upload_date || null,
      duration: data.duration || null,
      view_count: data.view_count || null,
      like_count: data.like_count || null,
      webpage_url: data.webpage_url || url,
      subtitles: data.subtitles || null,
      automatic_captions: data.automatic_captions || null,
      raw: data
    };

    process.stdout.write(JSON.stringify(out, null, 2));
    return;
  }

  if (mode === 'list-subs') {
    const ytArgs = [];
    if (skipDownload) ytArgs.push('--skip-download');
    ytArgs.push('--list-subs', url);

    const r = run(bin, ytArgs);
    if (r.code !== 0) {
      die({ tool: 'yt_dlp', ok: false, mode, url, error: 'yt-dlp failed', stderr: r.stderr.trim() });
    }

    // list-subs is text output; return as text for agent parsing.
    process.stdout.write(JSON.stringify({ tool: 'yt_dlp', ok: true, mode, url, output: r.stdout.trim() }, null, 2));
    return;
  }

  if (mode === 'get-subs') {
    const langs = (args.langs || '').trim() || (config.defaultSubtitleLangs || ['en']).join(',');
    const outDir = args.outDir || process.cwd();

    const ytArgs = [];
    if (skipDownload) ytArgs.push('--skip-download');
    ytArgs.push('--write-subs', '--write-auto-subs', '--sub-langs', langs);
    ytArgs.push('-o', path.join(outDir, '%(id)s.%(ext)s'));
    ytArgs.push(url);

    const r = run(bin, ytArgs);
    if (r.code !== 0) {
      die({ tool: 'yt_dlp', ok: false, mode, url, error: 'yt-dlp failed', stderr: r.stderr.trim() });
    }

    process.stdout.write(JSON.stringify({ tool: 'yt_dlp', ok: true, mode, url, langs, outDir, stdout: r.stdout.trim() }, null, 2));
    return;
  }

  die({ tool: 'yt_dlp', ok: false, error: `Unknown --mode ${mode}` }, 1);
}

main().catch((e) => {
  die({ tool: 'yt_dlp', ok: false, error: String(e) }, 99);
});
