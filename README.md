# AI-Running-Companion
An AI companion who can chat with you while you are running and analyse your running data .

## How to Use

1) Open the app
- Option A: Double‑click `index.html` to open it in your browser.
- Option B (recommended): Serve locally to avoid browser security limits.
  - Python: `python3 -m http.server` then visit `http://localhost:8000`

2) Enter your run details
- Fill in destination, distance (km), duration (min), average heart rate (bpm), age (optional), and notes.
- Click "Save/Update". The app stores your inputs in localStorage so they persist between visits.
- The panel shows a quick summary and a top tip based on your data.

3) Chat with the coach
- Type a message and press Enter or click "Send".
- Common topics: pace, heart rate zones, hydration, fueling, warm‑up, cool‑down, injuries.
- Clear the chat anytime with the "Clear" button.

4) Use voice features
- Click the mic button to speak; click again to stop listening.
- Toggle "Voice coach" in the header to enable/disable spoken replies (TTS).
- Notes:
  - Speech recognition uses the Web Speech API (webkitSpeechRecognition). It works best in Chromium‑based browsers.
  - Text‑to‑Speech depends on your system/browser voices.

5) Optional: OpenAI integration
- Toggle "Use OpenAI API" and paste your API key to get LLM‑generated responses.
- Security note: This demo calls the OpenAI API directly from the browser, which exposes your key to anyone using the page. For production, proxy requests through your own backend.

## Tips and Data Handling
- Pace, zones, hydration, and fueling suggestions are computed locally with a rule‑based coach. LLM is optional.
- Your run inputs are saved in `localStorage` only. Use "Clear" to reset.
- Health disclaimer: Tips are educational and not medical advice.

## Troubleshooting
- No mic input option: Your browser may not support the Web Speech API; you can still chat via text.
- No spoken replies: Enable "Voice coach" and confirm your system has TTS voices enabled.
- API errors: If OpenAI calls fail, the app automatically falls back to local coaching.
