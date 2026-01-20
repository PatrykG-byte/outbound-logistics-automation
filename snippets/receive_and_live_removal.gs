// Purpose: Receive confirmation (putaway): scan pallet + timestamp, persist confirmation, and (in production) remove pallet from Archive LIVE.
// Input: Sheet "Recive" cell A1 scans pallet ID.
// Output: "Recive OUT" append; on koniec() -> append to "Recive Dane".
// Validation highlights (case-study target):
// - accept only DC...
// - prevent confirming the same pallet twice
// - require pallet exists in Archive LIVE at processing time (TO BE FILLED IN)

function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Recive") return;
  if (e.range.getA1Notation() !== "A1") return;

  const wartosc = String(e.range.getValue()).trim().toUpperCase();
  if (wartosc === "") return;

  // Basic format validation
  if (!wartosc.startsWith("DC")) {
    sheet.getRange("B1").setValue("❌ Oczekiwany kod palety (DC...)");
    e.range.setValue("");
    return;
  }

  const teraz = new Date();
  const sheetOut = e.source.getSheetByName("Recive OUT");
  sheetOut.appendRow([wartosc, teraz]);

  e.range.setValue("");
  sheet.getRange("B1").setValue("📦 Zeskanuj kolejną paletę w A1");
}

function koniec() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetOut = ss.getSheetByName("Recive OUT");
  const dane = sheetOut.getDataRange().getValues();

  if (dane.length < 2) {
    SpreadsheetApp.getUi().alert("❌ Brak danych do przesłania.");
    return;
  }

  // TODO (case-study target):
  // - check duplicates in this batch
  // - check if pallet already confirmed in Recive Dane
  // - check if pallet exists in Archive LIVE
  // - after success: remove pallet rows from Archive LIVE

  const plikDocelowyId = "(TO BE FILLED IN)";
  const arkuszDocelowy = SpreadsheetApp.openById(plikDocelowyId).getSheetByName("Recive Dane");

  if (!arkuszDocelowy) {
    SpreadsheetApp.getUi().alert("❌ Nie znaleziono arkusza 'Recive Dane' w pliku docelowym.");
    return;
  }

  arkuszDocelowy.getRange(arkuszDocelowy.getLastRow() + 1, 1, dane.length - 1, dane[0].length)
    .setValues(dane.slice(1));

  sheetOut.clearContents();
  sheetOut.appendRow(["Paleta", "Czas skanowania"]);

  SpreadsheetApp.getUi().alert(`✅ Przesłano ${dane.length - 1} rekordów do 'Recive Dane'.`);
}

