# FinUnity Frontend — Build Instructions

## Stack required
- **Next.js** (App Router)
- **Tailwind CSS**
- Do NOT use Streamlit — this replaces an old Streamlit dashboard entirely

## What this dashboard shows (the "Glass Box" flow)
A judge/loan officer should see the full evidence chain, top to bottom:

1. Farmer profile (name, crop, land size)
2. Live sensor readings (soil moisture, battery, environment) from ESP8266
3. Weather data (rainfall, forecast)
4. Satellite/NDVI trend (if available)
5. Agricultural risk interpretation (plain language)
6. Financial risk assessment (deterministic score, NOT a black box)
7. AI debate summary (Advocate vs Skeptic arguments, then synthesis)
8. Final recommendation (voucher amount, marked "human review required")
9. Anchor redemption status
10. Updated farmer evidence timeline

## Rules
- Every number shown must come from a real API call to the backend — no fabricated/placeholder data in the final version
- If data is missing, show "Insufficient evidence" — never fake a confident number
- Keep it simple and readable — this is a hackathon demo, not a production SaaS dashboard

## Reference material
The old Streamlit dashboard (`dashboard.py`, kept in a local reference-only folder,
not in this repo) shows what data the backend previously exposed — use it to
understand data shapes, not to copy its layout. This is a redesign, not a port.

## API endpoints (to be defined in backend/)
(Fill in as backend/ingestion and backend/agents are built)