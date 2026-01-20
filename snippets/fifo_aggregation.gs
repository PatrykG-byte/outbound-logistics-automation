// Purpose: Merge operational LIVE + WMS shipment time + Receive confirmations into "Dane Raporty" (TOT-level dataset).
// Input: Archive LIVE, WMS table "Dane czas", Receive table "Recive Dane".
// Output: Sheet "Dane Raporty" (TOT, Paleta, STAGE, EUT, Shipment time, Data Receive, +20h).
// Key rules: de-dup TOTs; normalize STAGE; shipmentTime may be empty; sorting by shipmentTime.

function normalizeStage(stage) {
  return (stage || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/^STAGE ?/, "STAGE ");
}

function aktualizujIndeksTOT() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const arkuszDocelowy = ss.getSheetByName("Dane Raporty");
  if (!arkuszDocelowy) {
    SpreadsheetApp.getUi().alert("Brak arkusza 'Dane Raporty'");
    return;
  }

  arkuszDocelowy.clearContents();
  arkuszDocelowy.appendRow(["TOT", "Paleta", "STAGE", "EUT", "Shipment time", "Data Receive", "Data Receive +20h"]);

  const archiwumId = "(TO BE FILLED IN)";
  const outbandId = "(TO BE FILLED IN)";
  const reciveSheetId = "(TO BE FILLED IN)";

  const liveData = SpreadsheetApp.openById(archiwumId).getSheetByName("LIVE").getDataRange().getValues();
  const daneCzas = SpreadsheetApp.openById(outbandId).getSheetByName("Dane czas").getDataRange().getValues();
  const daneReceive = SpreadsheetApp.openById(reciveSheetId).getSheetByName("Recive Dane").getDataRange().getValues();

  const mapaCzasu = new Map();
  for (let i = 1; i < daneCzas.length; i++) {
    const [tot, czas] = daneCzas[i];
    if (tot && czas) mapaCzasu.set(tot, czas); // last-entry-wins if table has repeats
  }

  const mapaReceive = new Map();
  for (let i = 1; i < daneReceive.length; i++) {
    const [paleta, data] = daneReceive[i];
    if (paleta && data) mapaReceive.set(paleta, data);
  }

  const wynik = [];
  const zapisaneToty = new Set();
  let lastEUT = "", lastStage = "", lastPaleta = "";

  for (let i = 1; i < liveData.length; i++) {
    const [eutRaw, stageRaw, paletaRaw, tot] = liveData[i];
    if (!tot || zapisaneToty.has(tot)) continue;
    if (!paletaRaw) continue;

    if (eutRaw) lastEUT = eutRaw;
    if (stageRaw) lastStage = normalizeStage(stageRaw);
    if (paletaRaw) lastPaleta = paletaRaw;

    const shipmentTime = mapaCzasu.get(tot) || "";
    const dataReceive = mapaReceive.get(lastPaleta) || "";
    const dataPlus20 = dataReceive ? new Date(new Date(dataReceive).getTime() + 20 * 3600 * 1000) : "";

    wynik.push([tot, lastPaleta, lastStage, lastEUT, shipmentTime, dataReceive, dataPlus20]);
    zapisaneToty.add(tot);
  }

  wynik.sort((a, b) => {
    const tA = new Date(a[4]).getTime() || Infinity;
    const tB = new Date(b[4]).getTime() || Infinity;
    return tA - tB;
  });

  if (wynik.length > 0) {
    arkuszDocelowy.getRange(2, 1, wynik.length, 7).setValues(wynik);
  }

  arkuszDocelowy.getRange("Z1").setValue(new Date());
}

