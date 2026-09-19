# FinUnity — Project Notes

## What this is
A closed-loop agricultural financing system for thin-file Cambodian smallholder farmers,
combining hardware sensor evidence, an AI-assisted debate layer, and financial risk logic.

## Core data flow (Glass Box)
Farmer profile → ESP8266/ESP32 sensor readings (soil moisture, battery, environment)
→ Weather data → Satellite/NDVI (if available) → Agricultural risk interpretation
→ Financial risk engine (deterministic) → AI debate (Advocate/Skeptic/Synthesis)
→ Recommendation (human-reviewed) → Voucher issued → Anchor redemption → New evidence recorded

## Rules
- Financial math is deterministic code, never inside an LLM call
- AI explains and debates evidence, never auto-approves/rejects
- Every claim in README/docs must be tested before it's written down

## Current status (update as you go)
- [x] Repo skeleton created
- [ ] ESP8266 firmware: soil moisture + battery reading
- [ ] Backend telemetry ingestion
- [ ] Deterministic risk engine
- [ ] AI debate layer (Kimi, not yet started)
- [ ] Frontend (Next.js/Tailwind, not yet started)