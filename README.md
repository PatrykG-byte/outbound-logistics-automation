# Outbound Logistics Automation (Google Sheets + Apps Script) — Case Study

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

