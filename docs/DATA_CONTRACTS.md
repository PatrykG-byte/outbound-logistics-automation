# Data Contracts

This document defines formats, merge rules, and retention rules.

---

## Code formats (validation targets)

- **EUT**: must start with `EUT` (e.g., `EUT...`)
- **STAGE**: must start with `STAGE` (normalized to `STAGE <number>` or `STAGE <number>.<sub>`)
- **PALLET**: must start with `DC` (e.g., `DC12345`)
- **TOT**: container identifier (exact pattern depends on site; validate presence + non-empty)

(Exact regexes can be added if needed.)

---

## Uniqueness / lifecycle rules

- During active scanning, the system prevents:
  - duplicate pallet IDs (DC) within the active window
  - duplicate TOTs within the active window
- TOT identifiers can be reused after ~24h, but **not concurrently** in active pallets.

---

## WMS import rule (shipmentTime)

- `Dane czas` is append-only: `[TOT, shipmentTime]`
- Merge rule in analysis:
  - **last-entry-wins** per TOT

Reason:
- WMS exports may repeat TOT rows; the latest timestamp should be used.

---

## Operational dataset (Archive LIVE)

- LIVE is used as the operational truth for FIFO.
- Retention: **5 days** rolling window.
- Daily archive sheets keep full history (audit).

---

## Receive rule

- Receive writes `[PALLET, receiveTime]` into `Recive Dane`.
- After receive finalization:
  - all rows for that pallet are removed from Archive LIVE
  - pallet disappears from FIFO operational view

Validation level (CV build):
- pallet format check (`DC...`)
- dedupe (do not process the same pallet twice)
- require pallet to exist in Archive LIVE at processing time

---

## Required columns per dataset (minimal)

### Archive LIVE
- EUT
- STAGE
- PALLET
- TOT
- label/shift (optional)

### WMS `Dane czas`
- TOT
- shipmentTime

### Receive `Recive Dane`
- PALLET
- receiveTime

### Motherboard `Dane Raporty` (output)
- TOT, PALLET, STAGE, EUT, shipmentTime, receiveTime, receiveTime+20h
