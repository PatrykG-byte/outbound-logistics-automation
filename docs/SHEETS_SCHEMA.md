# Sheets Schema

This system uses multiple Google Sheets files. This document lists tabs and expected columns.

No production IDs are included.

---

## 1) Intake Scanner file (Side B)

### Tab: `Skanowanie`
- Input cells used for scanning phases (EUT / STAGE / PALLET / TOTs)
- Status cells (messages / phase)

### Tab: `SKAN`
Columns (logical):
- A: EUT
- B: STAGE
- C: PALLET (DC)
- D: TOT

---

## 2) Archive file

### Tab: `LIVE` (operational rolling set, 5 days)
Columns:
- A: EUT
- B: STAGE
- C: PALLET
- D: TOT
- E: shift/label (optional)

### Tab: `YYYY-MM-DD` (daily history sheets)
Same column structure as LIVE.

### Tab: `TOT MAPA`
Columns:
- TOT
- PALLET
- STAGE
- EUT
- archiveTimestamp

---

## 3) Outband Report file (WMS import)

### Tab: `WMS IN`
- Raw pasted export from WMS

### Tab: `Dane czas`
Columns:
- TOT
- shipmentTime

---

## 4) Motherboard file

### Tab: `Dane Raporty` (normalized dataset)
Columns:
- TOT
- PALLET
- STAGE
- EUT
- shipmentTime
- receiveTime
- receiveTime + 20h

### Tab: `FIFO Board`
Columns:
- Location (STAGE)
- Quantity of pallets
- Oldest shipmentTime
- shipmentTime + 8h
- receiveTime
- receiveTime + 20h
- EUT (transport/order)

---

## 5) Receive file

### Tab: `Recive`
- Scan input (e.g., A1)

### Tab: `Recive OUT`
Columns:
- PALLET
- scanTimestamp

### Tab: `Recive Dane` (target)
Columns:
- PALLET
- receiveTime
