# Changelog (Case Study)

## v1.0-case-study
- Added intake scanning state machine (EUT → STAGE → PALLET → TOTs) with cache-based duplicate prevention.
- Added archive transform (SKAN → DAILY + LIVE + TOT MAPA) with normalized rows.
- Added motherboard merge logic (Archive LIVE + WMS time + Receive) into a single TOT-level dataset.
- Added FIFO Board aggregation per STAGE (pallet count + oldest shipment time + deadlines).
- Added Receive flow snippet with validation targets documented (some production integrations left as TODO).
- Added documentation: architecture, sheets schema, data contracts, validation overview.
- Added synthetic sample CSVs (no production data).
- Removed all production identifiers and operational exports; replaced with placeholders.
