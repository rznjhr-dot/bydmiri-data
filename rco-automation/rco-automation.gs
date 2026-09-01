/**
 * BYD RCO AUTOMATION - v7.0 (FINAL)
 * 
 * Diagnostic confirmed all 19 placeholders exist at exact cells:
 *   {{CUSTOMER NAME}}    → A13    {{BODYPRICE}}   → P24
 *   {{CUSTOMER ADDRESS}} → A14    {{B2}}          → P39
 *   {{MODEL}}            → N13    {{EVPLATE}}     → P40
 *   {{COLOR}}            → N15    {{REGFEE}}      → P48
 *   {{DATE}}             → AC13   {{ROADTAX}}     → P49
 *   {{CUSTOMER IC}}      → G17    {{LOANAMOUNT}}  → Z49
 *   {{CHASSIS}}          → N18    {{TENURE}}      → AL49
 *   {{YM}}               → X18    {{INSURANCE}}   → P53
 *   {{CUSTOMER PHONE}}   → A20
 *   {{CUSTOMER EMAIL}}   → A22
 *   {{ENGINE}}           → N22
 * 
 * Data range: A1:AM78 (39 cols × 78 rows)
 * 
 * Key fixes:
 *   1. TextFinder ONLY (no hardcoded cells) — diagnostic confirmed all positions
 *   2. PDF: fitw=true + fith=true = force SINGLE PAGE
 *   3. No invalid URL params (removed horizontal_alignment, vertical_alignment, etc.)
 *   4. Alignment set on CELLS via setHorizontalAlignment, not in PDF URL
 *   5. VEHICLE_DATA directly — no DB lookups, no PENDING_REVIEW
 */

// === CONFIG ===
var CONFIG = {
  MASTER_TEMPLATE_ID: "1nHrgl60mq1G3MB0KccEHjHnntzY6u9Kd",
  RCO_SHEET_GID: 54712902,
  RESPONSE_SHEET_ID: "1qSVpvSA4gMEIaLs7FF5rukGYMM2UbQJYGK-U4p47U6I",
  FORM_ID: "1k9gaww1cFE821VlieTgRkEqvtadF0YHnzbb-c4ymg9o",
  OUTPUT_FOLDER_NAME: "RCO Output BYD",
  LOGS_SHEET: "LOGS"
};

var FORM_FIELDS = {
  CUSTOMER_NAME: "Customer Name",
  IC_NUMBER: "IC Number",
  PHONE_NUMBER: "Phone Number",
  EMAIL: "Email",
  ADDRESS: "Address",
  VARIANT: "Variant",
  COLOUR: "Colour",
  CHASSIS: "Chassis Number",
  ENGINE: "Engine Number",
  REG_NO: "Registration Number",
  YEAR_MAKE: "Year Make",
  LOAN_AMOUNT: "Loan Amount (MYR)",
  LOAN_PERIOD: "Loan Period (Months)",
  DOWNPAYMENT: "Downpayment (MYR)",
  TRADE_IN: "Trade-In Details",
  SALES_ADVISOR: "Sales Advisor",
  REMARKS: "Remarks"
};

// Direct vehicle data — EXACT figures from bydmiri-data.netlify.app (SSOT)
// rrp = selling price without insurance and without fees
// insurance = otr - otrWithoutInsurance (exact, with cents)
var VEHICLE_DATA = [
  { model: "BYD Atto 2", variant: "Premium", rrp: 103500, roadTax: 120, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 2323, otrNoIns: 104030, otr: 106353 },
  { model: "BYD Atto 3", variant: "Ultra", rrp: 129300, roadTax: 160, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 2859.25, otrNoIns: 129870, otr: 132729.25 },
  { model: "BYD Atto 3", variant: "Premium", rrp: 142300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 3182.90, otrNoIns: 143045, otr: 146227.90 },
  { model: "BYD Sealion 7", variant: "Dynamic", rrp: 167300, roadTax: 200, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 3609.05, otrNoIns: 167910, otr: 171519.05 },
  { model: "BYD Sealion 7", variant: "Premium", rrp: 192300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 4102.35, otrNoIns: 193045, otr: 197147.35 },
  { model: "BYD Sealion 7", variant: "Performance", rrp: 207300, roadTax: 965, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 4398.30, otrNoIns: 208675, otr: 213073.30 },
  { model: "BYD Seal", variant: "Premium", rrp: 175300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 3834.05, otrNoIns: 176045, otr: 179879.05 },
  { model: "BYD Seal", variant: "Performance", rrp: 195300, roadTax: 965, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 4228.70, otrNoIns: 196675, otr: 200903.70 },
  { model: "BYD Seal 6", variant: "Premium", rrp: 119300, roadTax: 180, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 2661.95, otrNoIns: 119890, otr: 122551.95 },
  { model: "BYD M6", variant: "Extended", rrp: 127300, roadTax: 160, b2Fee: 200, evPlate: 150, regFee: 60, insurance: 2859.25, otrNoIns: 127870, otr: 130729.25 }
];

// Format money: keep cents if present, integer otherwise
// NOTE: when run directly from editor (no args), it triggers addMissingTags (dropdown workaround)
function fmtMoney(n) {
  if (arguments.length === 0) {
    addMissingTags();
    redesignForm();
    return "";
  }
  if (n === null || n === undefined || n === "") return "";
  var num = Number(n);
  if (isNaN(num)) return String(n);
  if (Math.abs(num % 1) > 0.001) return num.toFixed(2);
  return String(Math.round(num));
}

// === TEMPLATE PATCHER — adds missing {{tags}} to master template ===
// Finds labels in column A and writes tags into column P of the same row.
// Run ONCE from the editor. Safe to re-run (overwrites same cells).
function addMissingTags() {
  var ss = SpreadsheetApp.openById(CONFIG.MASTER_TEMPLATE_ID);
  var sheet = ss.getSheetByName("RCO");
  if (!sheet) { Logger.log("ERROR: sheet RCO not found"); return; }
  
  var lastRow = sheet.getLastRow();
  var labels = sheet.getRange(1, 1, lastRow, 1).getValues();
  
  var map = {
    "OTR PRICE WITHOUT INSURANCE": "{{OTRNOINS}}",
    "INSURANCE": "{{INSURANCE}}",
    "OTR PRICE WITH INSURANCE": "{{OTRWITHINS}}"
  };
  
  var found = {};
  for (var r = 0; r < labels.length; r++) {
    var label = String(labels[r][0]).trim().toUpperCase();
    if (map[label] && !found[label]) {
      found[label] = true;
      sheet.getRange(r + 1, 16).setValue(map[label]); // col P = 16
      Logger.log("Row " + (r + 1) + " [" + label + "] -> P" + (r + 1) + " = " + map[label]);
    }
  }
  
  for (var k in map) {
    if (!found[k]) Logger.log("WARNING: label not found: " + k);
  }
  Logger.log("=== TEMPLATE PATCH DONE ===");
}

// === FORM REDESIGN — remove unused fields, compact layout ===
function redesignForm() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  
  // 1. Remove these fields (re-fetch items each iteration — references go stale after delete)
  var toRemove = ["Trade-In Details", "Registration Number", "Downpayment (MYR)"];
  var removed = [];
  for (var i = 0; i < toRemove.length; i++) {
    var items = form.getItems();
    var found = false;
    for (var j = 0; j < items.length; j++) {
      if (items[j].getTitle() === toRemove[i]) {
        form.deleteItem(items[j]);
        removed.push(toRemove[i]);
        found = true;
        break;
      }
    }
    if (!found) Logger.log("not found (already removed): " + toRemove[i]);
  }
  Logger.log("Removed: " + (removed.join(", ") || "none"));
  
  // 2. Compact: strip long descriptions, keep titles short
  var items2 = form.getItems();
  for (var j = 0; j < items2.length; j++) {
    try { items2[j].setHelpText(""); } catch (e) {}
  }
  
  // 3. List final layout
  var titles = [];
  for (var k = 0; k < form.getItems().length; k++) titles.push(form.getItems()[k].getType() + ": " + form.getItems()[k].getTitle());
  Logger.log("Final form items:\\n" + titles.join("\\n"));
  Logger.log("=== FORM REDESIGN DONE ===");
}

// === SETUP ===
function setupRCOAutomation() {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  var folders = DriveApp.getFoldersByName(CONFIG.OUTPUT_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.OUTPUT_FOLDER_NAME);
  PropertiesService.getScriptProperties().setProperty("OUTPUT_FOLDER_ID", folder.getId());
  
  var logSheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.LOGS_SHEET);
    logSheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "Error", "Field", "Details"]]).setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }
  
  reorderForm();
  createSpreadsheetTrigger();
  
  // Also redesign the form (remove unused fields)
  try {
    redesignForm();
  } catch (err) {
    Logger.log("redesignForm error: " + err);
  }
  
  Logger.log("=== SETUP COMPLETE ===");
  
  // Also patch the master template with missing tags
  try {
    addMissingTags();
  } catch (err) {
    Logger.log("addMissingTags error: " + err);
  }
  
  Logger.log("Form: https://docs.google.com/forms/d/" + CONFIG.FORM_ID + "/viewform");
  Logger.log("Output: " + folder.getUrl());
}

function reorderForm() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  var variantOptions = VEHICLE_DATA.map(function(v) { return v.model + " - " + v.variant; });
  
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === FORM_FIELDS.VARIANT) {
      if (items[i].getType() === FormApp.ItemType.LIST) {
        items[i].asListItem().setChoiceValues(variantOptions);
        items[i].setHelpText("Select model and variant");
      }
      // Move Variant before Colour if needed
      var colourIdx = -1;
      var items2 = form.getItems();
      for (var j = 0; j < items2.length; j++) {
        if (items2[j].getTitle() === FORM_FIELDS.COLOUR) { colourIdx = items2[j].getIndex(); break; }
      }
      if (colourIdx >= 0 && items[i].getIndex() > colourIdx) {
        form.moveItem(items[i].getIndex(), colourIdx);
      }
      Logger.log("Variant dropdown updated");
    }
    if (items[i].getTitle() === FORM_FIELDS.LOAN_PERIOD && items[i].getType() === FormApp.ItemType.LIST) {
      items[i].asListItem().setChoiceValues(["108", "96", "84", "72", "60", "48", "36", "24"]);
    }
  }
}

function createSpreadsheetTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("onFormSubmit").forSpreadsheet(CONFIG.RESPONSE_SHEET_ID).onFormSubmit().create();
  Logger.log("Trigger created");
}

// === MAIN ===
function onFormSubmit(e) {
  Logger.log("=== onFormSubmit FIRED ===");
  try {
    if (!e || !e.namedValues) {
      logError("No form data", "ALL", "e.namedValues null");
      return;
    }
    
    var nv = e.namedValues;
    var keys = Object.keys(nv);
    Logger.log("Form keys (" + keys.length + "): " + keys.join(", "));
    
    // Extract model + variant from dropdown
    // NOTE: response sheet has TWO "Variant" columns (old empty col 7, new col 20 with value).
    // namedValues picks the empty one, so read the last row directly from the sheet as fallback.
    var rawVariant = getFieldValue(nv, FORM_FIELDS.VARIANT) || getFieldValue(nv, "Model") || "";
    if (!rawVariant) {
      try {
        var respSheet = e.source.getSheets()[0];
        var lastRow = respSheet.getLastRow();
        var lastCol = respSheet.getLastColumn();
        var rowVals = respSheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];
        // take the LAST non-empty value that starts with "BYD"
        for (var ci = lastCol - 1; ci >= 0; ci--) {
          var v = String(rowVals[ci] || "").trim();
          if (v.indexOf("BYD") === 0) { rawVariant = v; break; }
        }
        Logger.log("Variant from sheet last row: " + rawVariant);
      } catch (err2) {
        Logger.log("sheet fallback error: " + err2);
      }
    }
    Logger.log("Raw Variant: " + rawVariant);
    
    var model = "";
    var variant = "";
    if (rawVariant && rawVariant.indexOf(" - ") > 0) {
      var parts = rawVariant.split(" - ");
      model = parts[0].trim();
      variant = parts[1].trim();
    }
    Logger.log("Parsed model: " + model + " | variant: " + variant);
    
    // Look up vehicle — rrp = selling price without insurance and without fees
    var vehicle = null;
    for (var i = 0; i < VEHICLE_DATA.length; i++) {
      if (VEHICLE_DATA[i].model.toLowerCase() === model.toLowerCase() &&
          VEHICLE_DATA[i].variant.toLowerCase() === variant.toLowerCase()) {
        vehicle = VEHICLE_DATA[i];
        break;
      }
    }
    
    if (vehicle) {
      Logger.log("Vehicle: rrp=" + vehicle.rrp + " roadTax=" + vehicle.roadTax + " b2=" + vehicle.b2Fee + " evPlate=" + vehicle.evPlate + " regFee=" + vehicle.regFee);
    } else {
      Logger.log("WARNING: No vehicle match for " + model + " " + variant);
    }
    
    var insurance = vehicle ? vehicle.insurance : 0;
    
    // Build ALL replacement values — ALL CAPS except email (lowercase)
    function cap(s) { return s ? String(s).toUpperCase() : ""; }
    function lower(s) { return s ? String(s).toLowerCase() : ""; }
    
    var replacements = {
      "{{CUSTOMER NAME}}":     cap(getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME)),
      "{{CUSTOMER ADDRESS}}":  cap(getFieldValue(nv, FORM_FIELDS.ADDRESS)),
      "{{CUSTOMER IC}}":       cap(getFieldValue(nv, FORM_FIELDS.IC_NUMBER)),
      "{{CUSTOMER PHONE}}":    cap(getFieldValue(nv, FORM_FIELDS.PHONE_NUMBER)),
      "{{CUSTOMER EMAIL}}":    lower(getFieldValue(nv, FORM_FIELDS.EMAIL)),
      "{{ADVISOR}}":           cap(getFieldValue(nv, FORM_FIELDS.SALES_ADVISOR)),
      "{{MODEL}}":             cap((model + " " + variant).trim()),
      "{{COLOR}}":             cap(getFieldValue(nv, FORM_FIELDS.COLOUR)),
      "{{CHASSIS}}":           cap(getFieldValue(nv, FORM_FIELDS.CHASSIS)),
      "{{ENGINE}}":            cap(getFieldValue(nv, FORM_FIELDS.ENGINE)),
      "{{YM}}":                cap(getFieldValue(nv, FORM_FIELDS.YEAR_MAKE)),
      "{{DATE}}":              formatDate(new Date()),
      "{{BODYPRICE}}":         vehicle ? fmtMoney(vehicle.rrp) : "",
      "{{B2}}":                vehicle ? fmtMoney(vehicle.b2Fee) : "",
      "{{EVPLATE}}":           vehicle ? fmtMoney(vehicle.evPlate) : "",
      "{{REGFEE}}":            vehicle ? fmtMoney(vehicle.regFee) : "",
      "{{ROADTAX}}":           vehicle ? fmtMoney(vehicle.roadTax) : "",
      "{{INSURANCE}}":         vehicle ? fmtMoney(vehicle.insurance) : "",
      "{{OTRNOINS}}":          vehicle ? fmtMoney(vehicle.otrNoIns) : "",
      "{{OTRWITHINS}}":        vehicle ? fmtMoney(vehicle.otr) : "",
      "{{LOANAMOUNT}}":        fmtMoney(getFieldValue(nv, FORM_FIELDS.LOAN_AMOUNT) || ""),
      "{{TENURE}}":            getFieldValue(nv, FORM_FIELDS.LOAN_PERIOD) || ""
    };
    
    // Log all replacements
    Logger.log("--- REPLACEMENTS ---");
    for (var ph in replacements) {
      Logger.log("  " + ph + " -> [" + replacements[ph] + "]");
    }
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    Logger.log("Template copied: " + rcoSheet.getName() + " (gid=" + rcoSheet.getSheetId() + ")");
    
    // Step 2: Replace ALL placeholders via TextFinder
    Logger.log("--- Replacing placeholders ---");
    for (var placeholder in replacements) {
      try {
        var value = String(replacements[placeholder]);
        // Replace ALL placeholders — empty string if no value (don't leave {{tag}} visible)
        var tf = rcoSheet.createTextFinder(placeholder);
        var count = tf.replaceAllWith(value);
        Logger.log("OK: " + placeholder + " -> [" + value + "] matches=" + count);
      } catch (tfErr) {
        Logger.log("ERROR: " + placeholder + ": " + tfErr.toString());
      }
    }
    
    // Step 3: Set left alignment on all data cells
    try {
      var lastRow = rcoSheet.getLastRow();
      var lastCol = rcoSheet.getLastColumn();
      var dataRange = rcoSheet.getRange(1, 1, lastRow, lastCol);
      dataRange.setHorizontalAlignment("left");
      Logger.log("Left alignment set for " + dataRange.getA1Notation());
    } catch (alignErr) {
      Logger.log("Alignment warning: " + alignErr.toString());
    }
    
    // Step 4: Generate PDF — fitw + fith = force SINGLE PAGE
    var pdfFile = generatePDF(copySS, rcoSheet, getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME));
    Logger.log("PDF: " + pdfFile.getUrl() + " (" + pdfFile.getSize() + " bytes)");
    
    // Step 5: Clean up draft sheet
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("=== RCO COMPLETE ===");
    
  } catch (err) {
    Logger.log("ERROR: " + err.toString());
    Logger.log("STACK: " + err.stack);
    logError(err.toString(), "CATCH", err.stack);
  }
}

function calcInsurance(rrp) {
  if (rrp < 100000) return 2300;
  if (rrp < 150000) return 3000;
  if (rrp < 200000) return 3500;
  return 4000;
}

// === RCO ===
function copyMasterTemplate() {
  var folderId = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  return DriveApp.getFileById(CONFIG.MASTER_TEMPLATE_ID).makeCopy("RCO_Draft_" + formatDate(new Date()), folder);
}

function getRCOSheet(spreadsheet) {
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === CONFIG.RCO_SHEET_GID) return sheets[i];
  }
  var byName = spreadsheet.getSheetByName("RCO");
  if (byName) return byName;
  return sheets[0];
}

function generatePDF(spreadsheet, sheet, customerName) {
  var sheetId = sheet.getSheetId();
  var ssId = spreadsheet.getId();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var colLetter = columnToLetter(lastCol);
  var rangeStr = "A1:" + colLetter + lastRow;
  
  Logger.log("PDF: range=" + rangeStr + " rows=" + lastRow + " cols=" + lastCol);
  
  // fitw=true + fith=true = fit everything onto ONE page
  // portrait=true = portrait A4
  // Only valid params — no horizontal_alignment/vertical_alignment in URL
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf" +
    "&gid=" + sheetId +
    "&size=A4" +
    "&portrait=true" +
    "&fitw=true" +
    "&fith=true" +
    "&gridlines=false" +
    "&printnotes=false" +
    "&printtitle=false" +
    "&fzr=false" +
    "&top_margin=0.25" +
    "&bottom_margin=0.25" +
    "&left_margin=0.25" +
    "&right_margin=0.25";
  
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    Logger.log("PDF HTTP error: " + response.getResponseCode());
    logError("PDF failed", "PDF", "HTTP " + response.getResponseCode());
    throw new Error("PDF failed: HTTP " + response.getResponseCode());
  }
  
  // Filename: RCO_CUSTOMER NAME_DDMMYY.pdf — always ALL CAPS
  var d = new Date();
  var dd = String(d.getDate()).padStart(2, "0");
  var mm = String(d.getMonth() + 1).padStart(2, "0");
  var yy = String(d.getFullYear()).substring(2);
  var fileName = ("RCO_" + (customerName || "CUSTOMER") + "_" + dd + mm + yy).toUpperCase() + ".pdf";
  var pdfBlob = response.getBlob().setName(fileName);
  var folderId = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var pdfFile = folder.createFile(pdfBlob);
  Logger.log("PDF created: " + pdfFile.getName() + " (" + pdfFile.getSize() + " bytes)");
  return pdfFile;
}

function columnToLetter(col) {
  var letter = "";
  while (col > 0) {
    var temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
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
    var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
    if (!sheet) return;
    sheet.appendRow([new Date(), message, field, details || ""]);
  } catch (e) { Logger.log("Log failed: " + e.toString()); }
}

// === DIAGNOSTIC ===
function diagnoseTemplate() {
  var ss = SpreadsheetApp.openById(CONFIG.MASTER_TEMPLATE_ID);
  var sheet = null;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === CONFIG.RCO_SHEET_GID) { sheet = sheets[i]; break; }
  }
  if (!sheet) sheet = sheets[0];
  
  Logger.log("=== TEMPLATE DIAGNOSTIC ===");
  Logger.log("Sheet: " + sheet.getName() + " ID: " + sheet.getSheetId());
  Logger.log("Data range: " + sheet.getDataRange().getA1Notation());
  Logger.log("Last row: " + sheet.getLastRow() + " Last col: " + sheet.getLastColumn());
  
  var placeholders = [
    "{{CUSTOMER NAME}}", "{{CUSTOMER ADDRESS}}", "{{MODEL}}", "{{COLOR}}",
    "{{DATE}}", "{{CUSTOMER IC}}", "{{CHASSIS}}", "{{YM}}",
    "{{CUSTOMER PHONE}}", "{{CUSTOMER EMAIL}}", "{{ENGINE}}",
    "{{BODYPRICE}}", "{{B2}}", "{{EVPLATE}}", "{{REGFEE}}",
    "{{ROADTAX}}", "{{LOANAMOUNT}}", "{{TENURE}}", "{{INSURANCE}}",
    "{{ADVISOR}}", "{{OTRNOINS}}", "{{OTRWITHINS}}"
  ];
  
  for (var i = 0; i < placeholders.length; i++) {
    var tf = sheet.createTextFinder(placeholders[i]);
    var results = tf.findAll();
    if (results.length === 0) {
      Logger.log("NOT FOUND: " + placeholders[i]);
    } else {
      for (var j = 0; j < results.length; j++) {
        Logger.log("FOUND: " + placeholders[i] + " -> " + results[j].getA1Notation());
      }
    }
  }
  Logger.log("=== DIAGNOSTIC COMPLETE ===");
}

// === MANUAL TEST ===
function testFormSubmit() {
  var e = {
    namedValues: {
      "Customer Name": "Test Customer",
      "IC Number": "880101140101",
      "Phone Number": "0123456789",
      "Email": "test@test.com",
      "Address": "Test Address 123, Miri",
      "Variant": "BYD Atto 3 - Ultra",
      "Colour": "White",
      "Chassis Number": "LGXC76A5X12345678",
      "Engine Number": "12345678",
      "Registration Number": "QAB 1234",
      "Year Make": "2025",
      "Loan Amount (MYR)": "116370",
      "Loan Period (Months)": "108",
      "Downpayment (MYR)": "12930",
      "Trade-In Details": "",
      "Sales Advisor": "RIDZUAN BIN JAHARI",
      "Remarks": "Test"
    }
  };
  onFormSubmit(e);
}
