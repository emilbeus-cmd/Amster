# Amsterdam Marathon 2026 Resale Monitor

A lightweight monitor that checks the official resale page continuously and alerts you as soon as a ticket appears.

## What it does

- Polls a resale URL on a configurable interval.
- Uses a **positive rule** (`AVAILABLE_SELECTOR` or `AVAILABLE_TEXT_REGEX`) to detect listings.
- Supports a **negative rule** (`UNAVAILABLE_TEXT_REGEX`) to avoid false positives.
- Sends an alert to:
  - stdout (always)
  - Slack/Discord webhook (optional)
  - email via SMTP (optional)
- Keeps running until interrupted.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium
```

## Configure

Copy and edit the example config:

```bash
cp .env.example .env
```

Minimum required values:

- `RESALE_URL`: official resale platform URL.
- One of:
  - `AVAILABLE_SELECTOR` (recommended if you can identify a listing element), or
  - `AVAILABLE_TEXT_REGEX` (regex that indicates availability).

Optional safety rule:

- `UNAVAILABLE_TEXT_REGEX`: regex like `no tickets available|sold out`.

## Run

```bash
python resale_monitor.py
```

## How to find selectors quickly

1. Open resale page in browser.
2. Inspect an available listing card/button.
3. Use a stable CSS selector (class/data-testid).
4. Set it in `AVAILABLE_SELECTOR`.

If selector is hard to identify, use `AVAILABLE_TEXT_REGEX` with phrases that only appear when resale entries exist.

## Notes

- Keep polling interval respectful (`POLL_INTERVAL_SECONDS` defaults to 30).
- If the site requires login/session/cookies, do one of:
  - monitor a page that is public,
  - extend script to load saved storage state via Playwright,
  - run headed mode and keep session alive.
