#Sanitized public extract from a production-used warehouse workflow automation (IDs/data removed).

This repository is a **case study + selected code snippets** from a real warehouse workflow automation.
It is **not** a drop-in “product” repository: production spreadsheet IDs and operational data are removed.

---

## Business problem

Inbound pallets were validated by **manual container (TOT) counting**, which:
- consumed ~**3×2h per shift**,
- introduced counting and traceability errors,
- made FIFO/overdue risk hard to monitor.

---

## What I built

A scan-driven workflow that creates a **trusted operational dataset** and a **FIFO board**:

- Intake scanning enforces structure and validation:
  **EUT → STAGE → PALLET (DC…) → TOTs**
- Data is written to an **Archive file**:
  - daily history sheets (audit trail),
  - a rolling operational sheet **LIVE** (retained **5 days**),
  - an index **TOT MAPA** (TOT → pallet / stage / EUT).
- WMS data provides **shipment time per TOT**:
  - stored in `Dane czas` (append-only),
  - analysis uses **last-entry-wins** per TOT.
- Receiving (putaway confirmation) removes pallets from the operational LIVE set:
  - pallet disappears from FIFO,
  - history remains in the daily archive.

---

## Key outcomes (what changed)

- Replaced routine manual counting (~**3×2h per shift**) with scan-driven validation and traceability.
- Created a FIFO visibility layer based on shipment time and receiving confirmation.
- Enabled fast lookup: where a pallet/TOT was, and what happened to it.

---

## End-to-end data flow (high level)



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
