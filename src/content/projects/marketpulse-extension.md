---
title: MarketPulse Chrome Extension
summary: >-
  A free Chrome extension that reads 24 public market-news RSS feeds, ranks every headline with
  transparent keyword rules, merges the same story from different publishers, and sends a desktop
  alert for important news. No server, no paid API.
kind: extension
status: complete
year: 2026
stack: [JavaScript, Chrome Extensions (MV3), Service Worker, RSS / Atom, Playwright]
highlights:
  - Own forgiving RSS/Atom parser, since a service worker has no DOMParser
  - Keyword scoring with a visible "Why" line, 11 categories and a breaking-news flag
  - Cross-publisher duplicate merging; ETag caching and backoff for failing feeds
  - chrome.alarms refresh with alerts never sent twice; 289 unit and 20 browser tests
flow: [chrome.alarms, Service worker, RSS feeds, Score + dedupe, Notification]
links:
  - label: Source code
    url: https://github.com/Mosiur99/marketpulse-extension
order: 5
---
