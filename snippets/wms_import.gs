// Purpose: Import WMS export into "Dane czas" as [TOT, shipmentTime].
// Input: "WMS IN" (TOT in col A, shipmentTime in col R).
// Output: Append rows to "Dane czas" (append-only).
// Note: downstream merge uses last-entry-wins per TOT.

function przetworzWMS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetIn = ss.getSheetByName("WMS IN");
  const sheetOut = ss.getSheetByName("Dane czas");

  if (!sheetIn || !sheetOut) throw new Error("Brakuje arkusza: 'WMS IN' lub 'Dane czas'");

  const inData = sheetIn.getDataRange().getValues();
  if (inData.length < 2) {
    SpreadsheetApp.getUi().alert("Brak danych do przetworzenia w 'WMS IN'");
    return;
  }

  const wynik = [];
  for (let i = 1; i < inData.length; i++) {
    const tot = inData[i][0];
    const czas = inData[i][17]; // col R
    if (tot && czas) wynik.push([tot, czas]);
  }

  if (wynik.length === 0) {
    SpreadsheetApp.getUi().alert("Nie znaleziono poprawnych wpisów (TOT + czas)");
    return;
  }

  const last = sheetOut.getLastRow();
  const MAX_ROWS = 500000;
  if (last + wynik.length > MAX_ROWS) {
    SpreadsheetApp.getUi().alert(`❌ Przekroczono limit ${MAX_ROWS} wierszy. Import przerwany.`);
    return;
  }

  sheetOut.getRange(last + 1, 1, wynik.length, 2).setValues(wynik);
  SpreadsheetApp.getUi().alert(`✅ Przetworzono ${wynik.length} rekordów z WMS IN`);
}

function wyczyscWMS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetIn = ss.getSheetByName("WMS IN");
  if (!sheetIn) {
    SpreadsheetApp.getUi().alert("Nie znaleziono arkusza 'WMS IN'");
    return;
  }
  sheetIn.clearContents();
  SpreadsheetApp.getUi().alert("🧹 Arkusz 'WMS IN' został wyczyszczony");
}
