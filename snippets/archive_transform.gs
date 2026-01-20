// Purpose: Transform SKAN rows into normalized archive rows and write to Archive (DAILY + LIVE + TOT MAPA).
// Input: Sheet "SKAN" (EUT/STAGE/DC/TOT in a stacked structure).
// Output: Archive file sheets: YYYY-MM-DD (daily), LIVE (rolling), TOT MAPA (index).
// Key validations: requires at least one TOT; propagates last seen EUT/STAGE/DC.

const ARCHIVE_FILE_ID = "(TO BE FILLED IN)";
const LIVE_SHEET_NAME = "LIVE";

function archiwizujSKAN() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SKAN");
  const archiveFile = SpreadsheetApp.openById(ARCHIVE_FILE_ID);

  const data = sheet.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  const godzina = new Date().getHours();
  const zmiana = (godzina >= 5 && godzina < 17) ? "ZMIANA I" : "ZMIANA II";
  const tytul = ss.getName();
  const strona = tytul.includes("strona A") ? "SKANER STRONA A"
               : tytul.includes("strona B") ? "SKANER STRONA B"
               : "NIEZNANA STRONA";
  const etykieta = `${today} ${zmiana} ${strona}`;

  let currentEUT = "", currentSTAGE = "", currentDC = "";
  const wynik = [];

  for (let i = 0; i < data.length; i++) {
    const [eut, stage, dc, tot] = data[i];
    if (eut) currentEUT = eut;
    if (stage) currentSTAGE = stage;
    if (dc) currentDC = dc;

    if (tot) {
      wynik.push([currentEUT, currentSTAGE, currentDC, tot, etykieta]);
    }
  }

  if (wynik.length === 0) {
    SpreadsheetApp.getUi().alert("❌ Brak danych do archiwizacji");
    return;
  }

  // DAILY sheet
  let sheetDzienny = archiveFile.getSheetByName(today);
  if (!sheetDzienny) sheetDzienny = archiveFile.insertSheet(today);
  sheetDzienny.getRange(sheetDzienny.getLastRow() + 1, 1, wynik.length, 5).setValues(wynik);

  // LIVE (operational)
  let sheetLive = archiveFile.getSheetByName(LIVE_SHEET_NAME);
  if (!sheetLive) sheetLive = archiveFile.insertSheet(LIVE_SHEET_NAME);
  else sheetLive.clearContents();

  sheetLive.appendRow(["EUT", "STAGE", "Paleta", "TOT", "ZMIANA"]);
  sheetLive.getRange(2, 1, wynik.length, 5).setValues(wynik);

  // TOT MAPA
  const totMapa = archiveFile.getSheetByName("TOT MAPA") || archiveFile.insertSheet("TOT MAPA");
  const teraz = new Date();
  const mapa = wynik.map(r => [r[3], r[2], r[1], r[0], teraz]);

  if (mapa.length > 0) {
    if (totMapa.getLastRow() === 0) {
      totMapa.appendRow(["TOT", "Paleta", "STAGE", "EUT", "D]()

