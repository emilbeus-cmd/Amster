#!/usr/bin/env python3
"""Continuously monitor a resale page and alert on ticket availability."""

from __future__ import annotations

import os
import re
import smtplib
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from typing import Optional

import requests
from dotenv import load_dotenv
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


@dataclass
class Settings:
    resale_url: str
    available_selector: Optional[str]
    available_text_regex: Optional[re.Pattern[str]]
    unavailable_text_regex: Optional[re.Pattern[str]]
    poll_interval_seconds: int
    page_timeout_ms: int
    headless: bool
    user_agent: Optional[str]
    webhook_url: Optional[str]
    smtp_host: Optional[str]
    smtp_port: int
    smtp_username: Optional[str]
    smtp_password: Optional[str]
    smtp_use_tls: bool
    email_from: Optional[str]
    email_to: Optional[str]


def _bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _compile_regex(value: Optional[str]) -> Optional[re.Pattern[str]]:
    if not value:
        return None
    return re.compile(value, re.IGNORECASE | re.MULTILINE)


def load_settings() -> Settings:
    load_dotenv()

    resale_url = os.getenv("RESALE_URL", "").strip()
    if not resale_url:
        raise ValueError("RESALE_URL is required.")

    available_selector = os.getenv("AVAILABLE_SELECTOR", "").strip() or None
    available_text_regex = _compile_regex(os.getenv("AVAILABLE_TEXT_REGEX", "").strip() or None)
    unavailable_text_regex = _compile_regex(os.getenv("UNAVAILABLE_TEXT_REGEX", "").strip() or None)

    if not available_selector and not available_text_regex:
        raise ValueError("Set AVAILABLE_SELECTOR or AVAILABLE_TEXT_REGEX to detect availability.")

    return Settings(
        resale_url=resale_url,
        available_selector=available_selector,
        available_text_regex=available_text_regex,
        unavailable_text_regex=unavailable_text_regex,
        poll_interval_seconds=int(os.getenv("POLL_INTERVAL_SECONDS", "30")),
        page_timeout_ms=int(os.getenv("PAGE_TIMEOUT_MS", "30000")),
        headless=_bool(os.getenv("HEADLESS", "true"), default=True),
        user_agent=os.getenv("USER_AGENT", "").strip() or None,
        webhook_url=os.getenv("WEBHOOK_URL", "").strip() or None,
        smtp_host=os.getenv("SMTP_HOST", "").strip() or None,
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME", "").strip() or None,
        smtp_password=os.getenv("SMTP_PASSWORD", "").strip() or None,
        smtp_use_tls=_bool(os.getenv("SMTP_USE_TLS", "true"), default=True),
        email_from=os.getenv("EMAIL_FROM", "").strip() or None,
        email_to=os.getenv("EMAIL_TO", "").strip() or None,
    )


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def detect_availability(page_text: str, selector_count: int, settings: Settings) -> bool:
    if settings.unavailable_text_regex and settings.unavailable_text_regex.search(page_text):
        return False

    if settings.available_selector and selector_count > 0:
        return True

    if settings.available_text_regex and settings.available_text_regex.search(page_text):
        return True

    return False


def send_webhook(webhook_url: str, message: str) -> None:
    payload = {"text": message}
    requests.post(webhook_url, json=payload, timeout=10).raise_for_status()


def send_email(settings: Settings, subject: str, message: str) -> None:
    if not all([settings.smtp_host, settings.email_from, settings.email_to]):
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = settings.email_to
    msg.set_content(message)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password or "")
        smtp.send_message(msg)


def notify(settings: Settings, message: str) -> None:
    print(message)

    if settings.webhook_url:
        try:
            send_webhook(settings.webhook_url, message)
            print(f"[{utc_now()}] Webhook notification sent.")
        except Exception as exc:
            print(f"[{utc_now()}] Webhook notification failed: {exc}", file=sys.stderr)

    try:
        send_email(settings, "Amsterdam Marathon resale ticket available", message)
    except Exception as exc:
        print(f"[{utc_now()}] Email notification failed: {exc}", file=sys.stderr)


def run_monitor(settings: Settings) -> None:
    print(f"[{utc_now()}] Starting monitor for {settings.resale_url}")
    print(f"[{utc_now()}] Poll interval: {settings.poll_interval_seconds}s")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=settings.headless)
        context_kwargs = {}
        if settings.user_agent:
            context_kwargs["user_agent"] = settings.user_agent
        context = browser.new_context(**context_kwargs)
        page = context.new_page()

        while True:
            timestamp = utc_now()
            try:
                page.goto(settings.resale_url, timeout=settings.page_timeout_ms, wait_until="domcontentloaded")
                page.wait_for_timeout(1500)
                page_text = page.inner_text("body")
                selector_count = 0
                if settings.available_selector:
                    selector_count = page.locator(settings.available_selector).count()

                available = detect_availability(page_text, selector_count, settings)

                if available:
                    message = (
                        f"[{timestamp}] ✅ Possible ticket availability detected on resale platform: "
                        f"{settings.resale_url}"
                    )
                    notify(settings, message)
                else:
                    print(f"[{timestamp}] No tickets detected.")

            except PlaywrightTimeoutError:
                print(f"[{timestamp}] Timeout while loading page.", file=sys.stderr)
            except Exception as exc:
                print(f"[{timestamp}] Monitor error: {exc}", file=sys.stderr)

            time.sleep(settings.poll_interval_seconds)


def main() -> None:
    try:
        settings = load_settings()
        run_monitor(settings)
    except KeyboardInterrupt:
        print(f"[{utc_now()}] Stopped by user.")
    except Exception as exc:
        print(f"Configuration/runtime error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
