[Scanner Intake (Side B)]
EUT → STAGE → DC → TOTs
|
v
[Archive File]

DAILY sheets (audit history)

LIVE (operational rolling set, 5 days)
 
TOT MAPA (TOT index)
|
v
[Motherboard]
LIVE + WMS time (Dane czas) + Receive (Recive Dane)
|
v
[FIFO Board]
STAGE-level overview + deadlines
^
|
[Receive]
scans pallet + timestamp
-> writes Recive Dane
-> removes pallet from Archive LIVE


---

## Repository structure

- `docs/ARCHITECTURE.md` — system components and flows
- `docs/SHEETS_SCHEMA.md` — tabs + columns used per module
- `docs/DATA_CONTRACTS.md` — code formats, merge rules, retention rules
- `snippets/` — selected Apps Script snippets (IDs removed)
- `samples/` — synthetic CSV examples (no production data)

---

## What is intentionally excluded

- Production IDs (Spreadsheet IDs / Script IDs)
- Full deployable Apps Script projects
- Real operational data exports

If you want to reproduce this system as a demo, replace placeholders marked:
**(TO BE FILLED IN)**

---

## Tech stack

- Google Sheets
- Google Apps Script (JavaScript)
- CacheService / PropertiesService patterns (state + de-duplication)

co to i gdzie dac
