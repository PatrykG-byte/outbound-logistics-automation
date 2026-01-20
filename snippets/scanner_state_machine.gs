// Purpose: Intake scan state machine (EUT → STAGE → DC → TOTs) with phase control and validation.
// Input: onEdit in A1/A2/A3 + manual button "akceptujKody".
// Output: Writes structured rows into sheet "SKAN".
// Key validations: required prefixes, duplicate prevention (cache + props), TOT count check.

function onEdit(e) {
  const ss = e.source;
  const sheetInput = ss.getSheetByName("Skanowanie");
  const sheetOutput = ss.getSheetByName("SKAN");
  const editedRange = e.range;
  const editedCell = editedRange.getA1Notation();
  const inputValue = editedRange.getValue().toString().trim().toUpperCase();
  const props = PropertiesService.getScriptProperties();
  const cache = CacheService.getScriptCache();

  if (sheetInput.getName() === "Skanowanie" && editedCell === "D10" && inputValue === "CZYŚĆ") {
    props.deleteProperty("used_dc_set");
    sheetInput.getRange("D10").clearContent();
    sheetInput.getRange("B2").setValue("✅ Wpisy DC zostały wyczyszczone");
    return;
  }

  if (!/^A[1-3]$/.test(editedCell)) return;

  let state = {};
  try {
    state = JSON.parse(props.getProperty("scan_state") || "{}");
  } catch {
    state = {};
  }

  if (!state.phase) {
    state = { phase: 1, dcCount: 0, eut: "", stage: "", dc: "", scanList: [] };
    sheetInput.getRange("A1:A30").setBackground("#ffffff");
    sheetInput.getRange("A1").setBackground("#b6d7a8");
  }

  function updateStatus() {
    sheetInput.getRange("F5").setValue("Faza: " + state.phase);
    sheetInput.getRange("B1").setValue("EUT: " + (state.eut || "-"));
    sheetInput.getRange("C1").setValue("STAGE: " + (state.stage || "-"));
    sheetInput.getRange("D1").setValue("Paleta: " + (state.dc || "-"));
    sheetInput.getRange("E1").setValue("DC Count: " + state.dcCount);
  }

  // Phase 1: EUT
  if (state.phase === 1 && editedCell === "A1") {
    if (!inputValue.startsWith("EUT")) {
      sheetInput.toast("Najpierw zeskanuj kod EUT", "Błąd", 5);
      sheetInput.getRange("B2").setValue("❌ Najpierw zeskanuj kod EUT");
      editedRange.setValue("");
      return;
    }

    const colD = sheetOutput.getRange("D:D").getValues().flat();
    const eutRow = colD.filter(Boolean).length + 2;
    sheetOutput.getRange(eutRow, 1).setValue(inputValue);

    state.eut = inputValue;
    state.phase = 2;
    props.setProperty("scan_state", JSON.stringify(state));
    sheetInput.getRange("B2").setValue("🔷 Skanuj STAGE w czerwonym oknie");
    editedRange.setValue("");

    sheetInput.getRange("A1:A3").setBackground("#ffffff");
    sheetInput.getRange("A2").setBackground("#ea9999");
    updateStatus();
    return;
  }

  // Phase 2: STAGE
  if (state.phase === 2 && editedCell === "A2") {
    const stageKey = "STAGE_" + inputValue;
    if (cache.get(stageKey)) {
      sheetInput.getRange("B2").setValue("❌ STAGE " + inputValue + " został już użyty");
      editedRange.setValue("");
      return;
    }
    if (!inputValue.startsWith("STAGE")) {
      sheetInput.toast("Oczekiwany STAGE", "Błąd", 5);
      sheetInput.getRange("B2").setValue("❌ Oczekiwany STAGE");
      editedRange.setValue("");
      return;
    }

    const lastRow = sheetOutput.getLastRow();
    sheetOutput.getRange(lastRow, 2).setValue(inputValue);
    state.stage = inputValue;
    cache.put(stageKey, "1", 21600); // cache window
    state.phase = 3;
    props.setProperty("scan_state", JSON.stringify(state));
    sheetInput.getRange("B2").setValue("🔷 Skanuj paletę w niebieskim oknie");
    editedRange.setValue("");

    sheetInput.getRange("A1:A30").clearContent().setBackground("#ffffff");
    sheetInput.getRange("A3").setBackground("#9fc5e8");
    updateStatus();
    return;
  }

  // Phase 3: PALLET (DC)
  if (state.phase === 3 && editedCell === "A3") {
    if (!inputValue.startsWith("DC")) {
      sheetInput.toast("Oczekiwany DC", "Błąd", 5);
      sheetInput.getRange("B2").setValue("❌ Oczekiwany DC");
      editedRange.setValue("");
      return;
    }

    if (!state.stage) {
      sheetInput.toast("Brakuje STAGE!", "Błąd", 5);
      sheetInput.getRange("B2").setValue("❌ Brak STAGE");
      editedRange.setValue("");
      return;
    }

    const dcKey = "DC_" + inputValue;
    const usedDCsRaw = props.getProperty("used_dc_set") || "{}";
    const usedDCs = JSON.parse(usedDCsRaw);
    if (cache.get(dcKey) || usedDCs[inputValue]) {
      sheetInput.getRange("B2").setValue("❌ Paleta " + inputValue + " już istnieje");
      editedRange.setValue("");
      return;
    }

    const lastD = sheetOutput.getRange(1, 4, sheetOutput.getLastRow()).getValues().flat().filter(Boolean).length;
    const dcRow = lastD + 2;
    sheetOutput.getRange(dcRow, 3).setValue(inputValue);
    cache.put(dcKey, "1", 21600);
    usedDCs[inputValue] = true;
    props.setProperty("used_dc_set", JSON.stringify(usedDCs));

    state.dc = inputValue;
    state.scanList = [];
    state.phase = 4; // TOT phase handled by akceptujKody
    props.setProperty("scan_state", JSON.stringify(state));
    sheetInput.getRange("B2").setValue("🔷 Zeskanuj 24 toty i kliknij Akceptacja");
    editedRange.setValue("");

    sheetInput.getRange("A1:A30").clearContent().clearFormat().setBackground("#d9d9d9");
    sheetInput.getRange("B10").clearContent();
    updateStatus();
    return;
  }
}

// === TOT acceptance ===

