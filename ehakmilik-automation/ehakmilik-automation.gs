/**
 * E-HAKMILIK AUTOMATION (BYD Miri)
 * Replicates the RCO generator flow but for the JPJ e-Hakmilik
 * ownership-claim confirmation letter (Google DOC template, not Sheets).
 *
 * Flow: Google Form submit → response sheet row → onFormSubmit trigger →
 *   copy master DOC → replace {{tags}} → export PDF → Drive folder.
 *
 * Template doc: 18lal4dI5dFYkEjs_6MvnGMZcWAKFD7A8mW0n_LZocBM
 * Tags (9): {{DATE}} {{OFFICER}} {{BANK}} {{HIRER}} {{ICNO}}
 *           {{CHASSIS}} {{ENGINE}} {{MODELVARIANT}} {{YM}}
 * Template already prefixes the model line with "BYD " — the tag value
 * is filled as "ATTO 3 - ULTRA" (no BYD prefix).
 * Signature line in the template is the literal RIDZUAN JAHARI (default).
 * If the optional Sales Advisor field is filled, the copy's signature is
 * swapped to that name; blank keeps RIDZUAN JAHARI.
 */

// === CONFIG ===
var CONFIG = {
  MASTER_TEMPLATE_DOC_ID: "18lal4dI5dFYkEjs_6MvnGMZcWAKFD7A8mW0n_LZocBM",
  OUTPUT_FOLDER_NAME: "eHakmilik Output BYD",
  LOGS_SHEET: "LOGS"
};

// Model-variant dropdown values — MUST match the website UI exactly
// (Google Forms requires exact choice text). Same 10 combos as RCO.
var MODEL_VARIANTS = [
  "BYD Atto 2 - Premium",
  "BYD Atto 3 - Ultra",
  "BYD Atto 3 - Premium",
  "BYD Sealion 7 - Dynamic",
  "BYD Sealion 7 - Premium",
  "BYD Sealion 7 - Performance",
  "BYD Seal - Premium",
  "BYD Seal - Performance",
  "BYD Seal 6 - Premium",
  "BYD M6 - Extended"
];

// Field titles — the response sheet headers are created from these.
var FORM_FIELDS = {
  HIRER: "Hirer Name",
  ICNO: "IC / Business Registration No",
  CHASSIS: "Chassis No",
  ENGINE: "Engine No",
  VARIANT: "Model Variant",
  YEAR_MAKE: "Year Make",
  BANK: "Bank",
  OFFICER: "Officer Name",
  SA: "Sales Advisor"
};

// === SETUP — creates form, response sheet, folder, trigger ===
// Idempotent: safe to re-run (IDs persisted in script properties).
function setupEhakmilikAutomation() {
  var props = PropertiesService.getScriptProperties();

  // 1. Form
  var formId = props.getProperty("FORM_ID");
  var form;
  if (formId) {
    form = FormApp.openById(formId);
    Logger.log("Form exists: " + form.getPublishedUrl());
  } else {
    form = FormApp.create("eHakmilik Generator (BYD Miri)");
    props.setProperty("FORM_ID", form.getId());
    Logger.log("Form created: " + form.getPublishedUrl());
  }

  // 2. Response spreadsheet
  var ssId = props.getProperty("RESPONSE_SHEET_ID");
  var ss;
  if (ssId) {
    ss = SpreadsheetApp.openById(ssId);
    Logger.log("Response sheet exists: " + ss.getUrl());
  } else {
    ss = SpreadsheetApp.create("eHakmilik Responses (BYD Miri)");
    ssId = ss.getId();
    props.setProperty("RESPONSE_SHEET_ID", ssId);
    Logger.log("Response sheet created: " + ss.getUrl());
  }

  // Link form → spreadsheet (only if not already linked)
  try {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);
  } catch (e) {
    Logger.log("setDestination note: " + e);
  }

  // 3. Questions — idempotent: only add items whose title is missing,
  //    so re-running setup on an existing form appends new fields (e.g. SA).
  var existingTitles = {};
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) existingTitles[items[i].getTitle()] = true;

  function ensureItem(title, required, type, choices) {
    if (existingTitles[title]) { Logger.log("Item exists: " + title); return; }
    if (type === "list") {
      var li = form.addListItem().setTitle(title).setRequired(required);
      li.setChoiceValues(choices);
    } else {
      form.addTextItem().setTitle(title).setRequired(required);
    }
    Logger.log("Item added: " + title);
  }

  ensureItem(FORM_FIELDS.HIRER, true, "text");
  ensureItem(FORM_FIELDS.ICNO, true, "text");
  ensureItem(FORM_FIELDS.CHASSIS, true, "text");
  ensureItem(FORM_FIELDS.ENGINE, true, "text");
  ensureItem(FORM_FIELDS.VARIANT, true, "list", MODEL_VARIANTS);
  ensureItem(FORM_FIELDS.YEAR_MAKE, true, "text");
  ensureItem(FORM_FIELDS.BANK, true, "text");
  ensureItem(FORM_FIELDS.OFFICER, true, "text");
  ensureItem(FORM_FIELDS.SA, false, "text"); // optional → blank defaults to RIDZUAN JAHARI
  Logger.log("Form now has " + form.getItems().length + " items");

  // 4. LOGS tab in response sheet
  var logSheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.LOGS_SHEET);
    logSheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "Error", "Field", "Details"]]).setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }

  // 5. Output folder
  var folders = DriveApp.getFoldersByName(CONFIG.OUTPUT_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.OUTPUT_FOLDER_NAME);
  props.setProperty("OUTPUT_FOLDER_ID", folder.getId());
  Logger.log("Output folder: " + folder.getUrl());

  // 6. Spreadsheet trigger (delete any old one first)
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("onFormSubmit").forSpreadsheet(ssId).onFormSubmit().create();
  Logger.log("Trigger created on: " + ss.getUrl());

  Logger.log("=== SETUP COMPLETE ===");
  Logger.log("Form: " + form.getPublishedUrl());
  Logger.log("Sheet: " + ss.getUrl());
  Logger.log("Folder: " + folder.getUrl());
}

// === MAIN HANDLER ===
function onFormSubmit(e) {
  Logger.log("=== onFormSubmit FIRED ===");
  try {
    var props = PropertiesService.getScriptProperties();
    var folderId = props.getProperty("OUTPUT_FOLDER_ID");
    if (!folderId) { logError("Setup not run", "ALL", "No OUTPUT_FOLDER_ID"); return; }
    var folder = DriveApp.getFolderById(folderId);

    if (!e || !e.namedValues) {
      logError("No form data", "ALL", "e.namedValues null");
      return;
    }

    var nv = e.namedValues;

    function cap(s) { return s ? String(s).toUpperCase() : ""; }

    // Variant fallback: read last response row if namedValues came up empty
    // (mirrors RCO — guards against duplicate-header quirks in the sheet)
    var rawVariant = getFieldValue(nv, FORM_FIELDS.VARIANT) || "";
    if (!rawVariant) {
      try {
        var respSheet = e.source.getSheets()[0];
        var lastRow = respSheet.getLastRow();
        var lastCol = respSheet.getLastColumn();
        var rowVals = respSheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];
        for (var ci = lastCol - 1; ci >= 0; ci--) {
          var v = String(rowVals[ci] || "").trim();
          if (v.indexOf("BYD") === 0) { rawVariant = v; break; }
        }
        Logger.log("Variant from sheet last row: " + rawVariant);
      } catch (err2) {
        Logger.log("sheet fallback error: " + err2);
      }
    }

    // Template writes "BYD {{MODELVARIANT}}" → strip the leading "BYD "
    var modelVariant = cap(rawVariant).replace(/^BYD\s+/i, "");

    var replacements = {
      "{{DATE}}": formatDate(new Date()),
      "{{OFFICER}}": cap(getFieldValue(nv, FORM_FIELDS.OFFICER)),
      "{{BANK}}": cap(getFieldValue(nv, FORM_FIELDS.BANK)),
      "{{HIRER}}": cap(getFieldValue(nv, FORM_FIELDS.HIRER)),
      "{{ICNO}}": cap(getFieldValue(nv, FORM_FIELDS.ICNO)),
      "{{CHASSIS}}": cap(getFieldValue(nv, FORM_FIELDS.CHASSIS)),
      "{{ENGINE}}": cap(getFieldValue(nv, FORM_FIELDS.ENGINE)),
      "{{MODELVARIANT}}": modelVariant,
      "{{YM}}": cap(getFieldValue(nv, FORM_FIELDS.YEAR_MAKE))
    };

    Logger.log("--- REPLACEMENTS ---");
    for (var ph in replacements) Logger.log("  " + ph + " -> [" + replacements[ph] + "]");

    var hirerName = replacements["{{HIRER}}"] || "CUSTOMER";

    // Sales Advisor signature override (optional): if the form field was
    // filled, swap the template's default RIDZUAN JAHARI for that name.
    var saName = cap(getFieldValue(nv, FORM_FIELDS.SA));
    if (saName) Logger.log("SA override: RIDZUAN JAHARI -> " + saName);

    // Step 1: copy master doc into output folder
    var copyFile = DriveApp.getFileById(CONFIG.MASTER_TEMPLATE_DOC_ID)
      .makeCopy("eHakmilik_Draft_" + formatDate(new Date()), folder);
    var doc = DocumentApp.openById(copyFile.getId());
    var body = doc.getBody();

    // Step 2: replace every tag via body.replaceText (regex — braces escaped)
    for (var tag in replacements) {
      try {
        var pattern = tag.replace(/[{}]/g, "\\$&"); // {{DATE}} → \{\{DATE\}\}
        var value = String(replacements[tag]).replace(/\$/g, "$$$$"); // $ in replacement → $$
        body.replaceText(pattern, value);
        Logger.log("OK: " + tag + " -> [" + replacements[tag] + "]");
      } catch (tfErr) {
        Logger.log("ERROR: " + tag + ": " + tfErr.toString());
      }
    }

    // Step 2b: signature swap — only when a Sales Advisor name was given.
    // Safe-guarded: if the template signature ever stops being RIDZUAN JAHARI
    // the replaceText below simply finds nothing and leaves the doc unchanged.
    if (saName) {
      var sigValue = String(saName).replace(/\$/g, "$$$$");
      body.replaceText("RIDZUAN\\s+JAHARI", sigValue);
      Logger.log("Signature swapped to: " + saName);
    }
    doc.saveAndClose();

    // Step 3: export PDF (docs export — page setup comes from the template)
    var pdfBlob = exportDocAsPdf(copyFile.getId());
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var yy = String(d.getFullYear()).substring(2);
    var fileName = ("EHAKMILIK_" + hirerName + "_" + dd + mm + yy) + ".pdf";
    var pdfFile = folder.createFile(pdfBlob.setName(fileName));
    Logger.log("PDF created: " + pdfFile.getName() + " (" + pdfFile.getSize() + " bytes) " + pdfFile.getUrl());

    // Step 4: trash the draft doc (keep only the PDF)
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("=== E-HAKMILIK COMPLETE ===");

  } catch (err) {
    Logger.log("ERROR: " + err.toString());
    Logger.log("STACK: " + err.stack);
    logError(err.toString(), "CATCH", err.stack);
  }
}

function exportDocAsPdf(docId) {
  var url = "https://docs.google.com/document/d/" + docId + "/export?format=pdf";
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error("PDF export failed: HTTP " + response.getResponseCode());
  }
  return response.getBlob();
}

// === UTILS ===
function getFieldValue(namedValues, fieldName) {
  var val = namedValues[fieldName];
  if (!val || (Array.isArray(val) && !val[0])) {
    var keys = Object.keys(namedValues);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === fieldName.toLowerCase()) { val = namedValues[keys[i]]; break; }
    }
  }
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

function formatDate(date) {
  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0");
  var yy = String(date.getFullYear()).substring(2);
  return dd + "/" + mm + "/" + yy;
}

function logError(message, field, details) {
  try {
    var ssId = PropertiesService.getScriptProperties().getProperty("RESPONSE_SHEET_ID");
    if (!ssId) return;
    var sheet = SpreadsheetApp.openById(ssId).getSheetByName(CONFIG.LOGS_SHEET);
    if (!sheet) return;
    sheet.appendRow([new Date(), message, field, details || ""]);
  } catch (e) { Logger.log("Log failed: " + e.toString()); }
}

// === DIAGNOSTIC — confirm every {{tag}} exists in the master doc ===
function diagnoseTemplate() {
  var doc = DocumentApp.openById(CONFIG.MASTER_TEMPLATE_DOC_ID);
  var text = doc.getBody().getText();
  Logger.log("=== TEMPLATE DIAGNOSTIC (DOC) ===");
  var tags = ["{{DATE}}", "{{OFFICER}}", "{{BANK}}", "{{HIRER}}", "{{ICNO}}", "{{CHASSIS}}", "{{ENGINE}}", "{{MODELVARIANT}}", "{{YM}}"];
  for (var i = 0; i < tags.length; i++) {
    var idx = text.indexOf(tags[i]);
    Logger.log(tags[i] + " -> " + (idx >= 0 ? "FOUND at char " + idx : "MISSING"));
  }
  Logger.log("Doc length: " + text.length + " chars");
}
