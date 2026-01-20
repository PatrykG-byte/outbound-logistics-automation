# Changelog

## Production (internal)
- Deployed Google Sheets + Apps Script workflow: intake scan → archive → merge WMS time → FIFO board → receive confirmation.
- Implemented validations (format/order/duplicates), FIFO deadlines (+8h / +20h), and operational retention (rolling LIVE + history).
- Ran in warehouse operations for several weeks; iterated fixes based on operator feedback. (Details redacted)

## Public repository (sanitized)
- Published selected snippets + docs to explain architecture and logic.
- Removed production IDs and real datasets; added synthetic samples.
- Marked missing wiring as **(TO BE FILLED IN)** to enable safe reproduction.
