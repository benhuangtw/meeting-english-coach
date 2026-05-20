# Privacy Notes

## What This App Sends To Gemini

When you use transcription or analysis, the app sends data directly from your browser to the Gemini API:

- Uploaded audio content for transcription
- Transcript text for analysis
- Prompt text required for the coaching output

The project does not send this data through a project-owned backend server.

## What Stays In The Browser

These values are stored in the current browser's `localStorage` for the current origin:

- Gemini API key
- Local settings such as proxy mode
- Review history summaries
- Bookmarked practice items

## What Review History Stores

Review history is intentionally minimized. It may store:

- File name
- Processing date
- Rating
- Issue counts
- Top patterns
- Short takeaway text
- Top suggestions
- Practice phrases
- Next-meeting practice sentence summaries

## What This App Does Not Persist

- Full transcript text
- Raw audio files
- Base64 audio payloads
- Full raw Gemini responses
- API keys inside review history
- Full analysis JSON snapshots

## Localhost Proxy

The optional proxy started with `npm run start:proxy`:

- Binds only to `127.0.0.1`
- Only accepts localhost origins
- Forwards Gemini requests only
- Is intended for local troubleshooting, not public deployment

## Important Limits

- If a user clears browser storage, local history and saved settings are lost.
- If a user changes browser or device, saved local data does not follow them.
- If a user uses Gemini's free tier, Google may use prompts and responses for product improvement. Review the current Gemini API pricing and policy before uploading sensitive material.

Reference:

- <https://ai.google.dev/gemini-api/docs/pricing?hl=en>

## Recommendation

Do not upload confidential meetings, customer data, or recordings containing personal data unless you are comfortable with the risks and the Gemini plan you are using.
