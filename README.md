# Selected code snippets (Apps Script)

This folder contains **selected snippets** that demonstrate:
- scan state machine design (phase-based intake)
- validation and de-duplication patterns
- data transformation for archiving
- merging operational data with WMS timestamps (last-entry-wins)
- FIFO aggregation logic
- receive confirmation and removal from operational LIVE set

## Safety / privacy
- Production Spreadsheet IDs and Script IDs are removed.
- Any value marked as **(TO BE FILLED IN)** must be provided in a private config, not committed.

## Suggested snippet list
- `scanner_state_machine.gs`
- `archive_transform.gs`
- `wms_import.gs`
- `motherboard_merge.gs`
- `fifo_aggregation.gs`
- `receive_and_live_removal.gs`

Each snippet should begin with a short header:
- Purpose
- Input
- Output
- Key validations
