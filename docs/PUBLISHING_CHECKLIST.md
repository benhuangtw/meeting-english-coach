# Publishing Checklist

## Before Making The Repo Public

- Confirm there are no real API keys, tokens, or `.env` files in the working folder.
- Confirm screenshots, recordings, and sample transcripts do not contain private content.
- Keep personal deployment notes in `docs/PRIVATE_NOTES.md`, not in tracked files.
- Review README wording so it describes the public product, not your personal setup.
- Decide whether you want to add a license before publishing.

## Repository Basics

- Run `npm install`.
- Run `npm run check`.
- Run `npx playwright install chromium`.
- Run `npm test`.

## Public Repo Expectations

- Make sure the app works with a fresh browser profile.
- Make sure first-run instructions in `README.md` match the actual UI.
- Make sure privacy expectations in `PRIVACY.md` still match the code.
- Make sure localhost proxy limitations are documented clearly.

## Optional Nice-To-Haves

- Add a `LICENSE` file.
- Add screenshots or a short demo GIF.
- Add GitHub Pages or other static hosting instructions if you want a live demo.
- Add issue templates if you expect outside feedback.
