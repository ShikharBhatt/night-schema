---
description: "Use when handling secrets, credentials, environment configuration, or debugging database/API connection issues. Prevents reading or exposing .env files and secret values in responses."
name: "Do Not Read Env Files"
---
# Do Not Read .env Files

- Never open or read any `.env` file content.
- Never print, summarize, or transform secret values from environment files.
- If a task appears to require `.env` contents, ask the user for non-secret placeholders instead.
- Prefer diagnostics that do not require secret inspection, such as network reachability tests, host/port checks, and service health endpoints.
- If the user explicitly asks to read `.env`, refuse that step and offer a safer alternative.
