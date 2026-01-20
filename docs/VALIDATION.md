# Validation & Data Quality (Case Study)

This project is designed around one core idea: **operators make fewer mistakes when the system enforces a strict flow and validates inputs early**.

Below is a practical list of validations used across the workflow. Some items are implemented directly in the shared snippets, and some are intentionally shown as **TODO** to avoid publishing production-specific integrations.

---

## 1) Intake scanning (EUT → STAGE → PALLET → TOTs)

**Goal:** prevent broken or incomplete intake records.

- **Scan order enforced**
  - EUT must be scanned first, then STAGE, then PALLET (DC...), then TOTs.
- **Format validation**
  - EUT must start with `EUT`
  - STAGE must start with `STAGE`
  - pallet must start with `DC`
- **Duplicate prevention (active window)**
  - pallets and TOTs are blocked if they appear again within the cache window.
- **TOT count rule**
  - standard case: 24 TOTs per pallet
  - exceptions: fewer TOTs allowed only when the operator explicitly confirms the count.

**Relevant snippet(s):**
- `snippets/scanner_state_machine.gs`

---

## 2) Archiving & audit trail

**Goal:** keep a clean operational dataset for analysis while retaining history.

- **Normalization during archive**
  - stacked intake rows are transformed into normalized rows:  
    `EUT, STAGE, Pallet, TOT, ShiftLabel`
- **Daily audit history**
  - written into a date-based sheet (YYYY-MM-DD).
- **Operational LIVE dataset**
  - maintained for a short rolling period (case-study: “few days”) to support FIFO and lookups.
- **Indexing**
  - `TOT MAPA` is updated to support fast TOT → pallet/stage/EUT lookup.

**Relevant snippet(s):**
- `snippets/archive_transform.gs`

---

## 3) Data merge (LIVE + WMS time + Receive)

**Goal:** build a single TOT-level dataset for FIFO logic.

- **Stage normalization**
  - spacing/casing normalized (e.g. `STAGE 1`).
- **De-duplication**
  - TOT duplicates are skipped in the merged output.
- **Missing time handling**
  - shipment time may be empty; FIFO aggregation ignores rows without a valid shipment time.
- **Receive enrichment**
  - if a pallet has a Receive timestamp, the dataset also stores `Receive +20h`.

**Relevant snippet(s):**
- `snippets/motherboard_merge.gs`

---

## 4) FIFO board (STAGE-level aggregation)

**Goal:** show where work should happen first.

- **Unique pallet counting per STAGE**
- **Oldest shipment time drives urgency**
  - `shipmentTime + 8h` = deadline to complete putaway.
- **Priority helper**
  - top N stages with the oldest shipment times (optional display)

**Relevant snippet(s):**
- `snippets/fifo_aggregation.gs`

---

## 5) Receive confirmation (Putaway)

**Goal:** confirm the pallet was moved off STAGE and stop showing it on FIFO.

Minimum validations (case-study target):
- **Format validation**
  - pallet must be `DC...`
- **No double confirmation**
  - the same pallet cannot be confirmed twice
- **Must exist in operational LIVE at processing time**
  - prevents confirming a pallet that is not currently tracked
- **After confirmation**
  - remove pallet rows from Archive LIVE (so FIFO no longer shows it)

**Status in this repository:**
- The base Receive flow is shown.
- Production-specific checks (cross-file lookups + LIVE removal) are represented as **TODO**, because publishing full deployable integrations would require exposing internal IDs and system wiring.

**Relevant snippet(s):**
- `snippets/receive_and_live_removal.gs`

---

## Notes on security & privacy

This repository intentionally excludes:
- production Spreadsheet IDs / Script IDs
- real operational WMS exports
- full deployable Apps Script projects

Placeholders are marked as:
**(TO BE FILLED IN)**

