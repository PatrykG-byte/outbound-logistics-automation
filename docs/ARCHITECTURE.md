# Architecture

This document describes the end-to-end workflow and the role of each module.

---

## Entities

- **EUT** — transport/order identifier used as the main grouping key during intake.
- **STAGE** — staging location in the warehouse layout.
- **PALLET** — scanned as `DC...`
- **TOT** — container identifier (appears under a pallet); may be reused after ~24h, but not concurrently in active pallets.
- **shipmentTime** — timestamp imported from WMS per TOT.
- **receiveTime** — timestamp confirming the pallet was received/putaway.

---

## Modules

### 1) Intake Scanner (Side B)
Purpose:
- enforce scan order: EUT → STAGE → PALLET → TOTs
- validate formats and prevent duplicates during active scanning window
- blocks the input of incorrect data in a given step.
- prepare data for archiving
- block duplicates 

Main behaviors:
- phase/state machine stored in Script Properties (phase, current EUT/STAGE/DC)
- de-duplication via CacheService during scanning
- writes structured rows to a local sheet used for archiving export

### 2) Archive File
Purpose:
- persist intake results into:
  - **DAILY** sheets (audit history)
  - **LIVE** sheet (operational rolling dataset; retention = **5 days**)
  - **TOT MAPA** (index for fast lookup)

Notes:
- LIVE is the main operational source for FIFO and motherboard merges.
- DAILY sheets preserve history even after LIVE retention cleanup.

### 3) Outband Report (WMS import)
Purpose:
- import WMS output into `Dane czas` as `[TOT, shipmentTime]`

Rules:
- append-only table
- downstream logic uses **last-entry-wins** per TOT

### 4) Receive (Putaway confirmation)
Purpose:
- scan pallet ID and timestamp
- write `[Pallet, receiveTime]` into `Recive Dane`
- remove that pallet from **Archive LIVE**, so it disappears from FIFO

Validation :
- accept only pallet format `DC...`
- block duplicates (same pallet sent twice)
- require pallet to exist in Archive LIVE at the time of processing

### 5) Motherboard (Central processing)
Purpose:
- merge:
  - Archive LIVE (TOT/pallet/stage/EUT)
  - WMS `Dane czas` (shipment time per TOT)
  - `Recive Dane` (receive time per pallet)
- output:
  - `Dane Raporty` — normalized dataset at TOT level
  - `FIFO Board` — aggregated view at STAGE level

---

## FIFO board logic (STAGE-level)
For each STAGE:
- count pallets (unique DC)
- find the oldest shipmentTime among TOTs in that STAGE
- compute:
  - `shipmentTime + 8h` (deadline for putaway)
  - `receiveTime` and `receiveTime + 20h` (SLA tracking)

When a pallet is received:
- it is removed from Archive LIVE
- it is no longer included in Motherboard/FIFO operational computations
- daily archive remains as history
