# Meeting English Coach

A local-first web app for reviewing your spoken English from meeting recordings with Gemini.

Upload a short audio clip, generate a transcript, correct it if needed, and get practice-focused feedback for future meetings. This project is built for real-world speaking review, not generic grammar correction.

## Why This Exists

Many English speaking tools rewrite everything into perfect textbook English. That is not very helpful if what you actually want is:

- what sounded unnatural in a real meeting
- which habits are worth fixing first
- what to practice before the next call

`Meeting English Coach` is designed for that narrower use case.

## What It Does

- Transcribes a meeting audio clip with Gemini
- Lets you manually correct the transcript before analysis
- Highlights phrasing habits, weak patterns, and more natural alternatives
- Generates practice phrases for your next meeting
- Saves lightweight history and bookmarks in browser `localStorage`
- Supports batch processing for multiple audio files

## Project Style

- Local-first
- No account system
- No project-managed backend
- Bring your own Gemini API key

This repository is intended to be cloned and run locally. Each user uses their own Gemini API key and their own browser storage.

## Quick Start

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm start
```

Open:

```text
http://127.0.0.1:5500
```

### First Run

1. Open `設定`
2. Paste your own Gemini API key
3. Save settings
4. Go back to `分析`
5. Upload an audio file and start

Gemini API keys:

```text
https://aistudio.google.com/apikey
```

## How The Flow Works

1. Upload an audio file
2. Gemini transcribes it
3. You review and correct the transcript
4. Gemini analyzes your speaking
5. The app returns learning-oriented feedback and downloadable notes

## Tech Stack

- Plain HTML / CSS / JavaScript
- Local static server for development
- Optional Express proxy fallback for Gemini requests
- Playwright smoke tests for batch mode

## Audio Limits

This version uploads audio as Gemini inline base64 and applies a hard file-size limit:

- `< 15MB`: allowed
- `>= 15MB`: blocked before transcription

Supported formats:

- `mp3`
- `m4a`
- `wav`
- `webm`
- `mp4`
- `aac`
- `flac`

## Gemini Defaults

- Transcription: `gemini-2.5-flash`
- Analysis: `gemini-2.5-flash-lite`

By default, the Gemini API key is stored only in the current browser's `localStorage` for the current origin.

Do not share your Gemini API key with other people, and never commit it into source control.

## Optional Local Proxy

If direct browser access to Gemini fails, you can run the localhost proxy:

```bash
npm run start:proxy
```

Then enable proxy mode in the app settings.

Current proxy behavior:

- Binds to `127.0.0.1`
- Only allows `localhost` / `127.0.0.1` origins
- Only forwards Gemini `generateContent`
- Does not serve the app itself
- Is intended for local troubleshooting only and should not be deployed to a public server

## Development

Syntax check:

```bash
npm run check
```

Batch-mode test:

```bash
npx playwright install chromium
npm test
```

## Privacy

This app avoids storing your audio and API key on a project-owned backend, but it still sends content to Gemini when you run transcription and analysis.

- Audio is sent directly from your browser to the Gemini API for transcription.
- Transcript text is sent directly from your browser to the Gemini API for analysis.
- The project does not route this data through a project-owned server.
- Review history stored in `localStorage` is intentionally minimized and does not include full transcripts, audio, raw Gemini responses, or full analysis JSON.
- If you use Gemini's free tier, Google may use prompts and responses for product improvement. Review the current Gemini API policy before uploading sensitive material.

See [PRIVACY.md](./PRIVACY.md) for storage and data-flow details.

## Publishing Notes

Before making the repository public, review [docs/PUBLISHING_CHECKLIST.md](./docs/PUBLISHING_CHECKLIST.md).

If you want to keep personal deployment notes, copy [docs/PRIVATE_NOTES.template.md](./docs/PRIVATE_NOTES.template.md) to `docs/PRIVATE_NOTES.md`. That file is gitignored.
