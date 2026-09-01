/**
 * BYD RCO AUTOMATION - v6.0 (DIAGNOSTIC + FINAL)
 * 
 * Strategy change:
 *   - Phase 1: Diagnostic function finds EXACT cell positions of all {{placeholders}}
 *   - Phase 2: Use ONLY TextFinder (no hardcoded cells = no wrong positions)
 *   - PDF: portrait A4, fitw=true, NO invalid params, NO range param
 *   - Alignment: set on CELLS not in PDF URL
 *   - No DB lookups, no PENDING_REVIEW — VEHICLE_DATA directly
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

var VEHICLE_DATA = [
  { model: "BYD Atto 2", variant: "Premium", rrp: 103500, roadTax: 120, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Atto 3", variant: "Ultra", rrp: 129300, roadTax: 160, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Atto 3", variant: "Premium", rrp: 142300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Sealion 7", variant: "Dynamic", rrp: 167300, roadTax: 200, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Sealion 7", variant: "Premium", rrp: 192300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Sealion 7", variant: "Performance", rrp: 207300, roadTax: 965, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Seal", variant: "Premium", rrp: 175300, roadTax: 335, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Seal", variant: "Performance", rrp: 195300, roadTax: 965, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD Seal 6", variant: "Premium", rrp: 119300, roadTax: 180, b2Fee: 200, evPlate: 150, regFee: 60 },
  { model: "BYD M6", variant: "Extended", rrp: 127300, roadTax: 160, b2Fee: 200, evPlate: 150, regFee: 60 }
];

// All placeholders to search for
var PLACEHOLDERS = [
  "{{CUSTOMER NAME}}",
  "{{CUSTOMER ADDRESS}}",
  "{{MODEL}}",
  "{{COLOR}}",
  "{{DATE}}",
  "{{CUSTOMER IC}}",
  "{{CHASSIS}}",
  "{{YM}}",
  "{{CUSTOMER PHONE}}",
  "{{CUSTOMER EMAIL}}",
  "{{ENGINE}}",
  "{{BODYPRICE}}",
  "{{B2}}",
  "{{EVPLATE}}",
  "{{REGFEE}}",
  "{{ROADTAX}}",
  "{{LOANAMOUNT}}",
  "{{TENURE}}",
  "{{INSURANCE}}"
];

// === DIAGNOSTIC: Find exact cell positions ===
function diagnoseTemplate() {
  var ss = SpreadsheetApp.openById(CONFIG.MASTER_TEMPLATE_ID);
  var sheet = null;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === CONFIG.RCO_SHEET_GID) { sheet = sheets[i]; break; }
  }
  if (!sheet) sheet = sheets[0];
  
  Logger.log("=== TEMPLATE DIAGNOSTIC ===");
  Logger.log("Sheet name: " + sheet.getName());
  Logger.log("Sheet ID: " + sheet.getSheetId());
  Logger.log("Data range: " + sheet.getDataRange().getA1Notation());
  Logger.log("Last row: " + sheet.getLastRow());
  Logger.log("Last col: " + sheet.getLastColumn());
  
  // Find each placeholder
  for (var i = 0; i < PLACEHOLDERS.length; i++) {
    var ph = PLACEHOLDERS[i];
    var tf = sheet.createTextFinder(ph);
    var results = tf.findAll();
    if (results.length === 0) {
      Logger.log("NOT FOUND: " + ph);
    } else {
      for (var j = 0; j < results.length; j++) {
        var cell = results[j];
        var row = cell.getRow();
        var col = cell.getColumn();
        var a1 = cell.getA1Notation();
        var val = cell.getValue();
        // Truncate long values
        var valStr = String(val).substring(0, 100);
        Logger.log("FOUND: " + ph + " → " + a1 + " (row=" + row + " col=" + col + ") val=[" + valStr + "]");
      }
    }
  }
  
  // Check for any merged cells
  var merged = sheet.getMergedRanges();
  Logger.log("Merged ranges: " + merged.length);
  for (var m = 0; m < merged.length && m < 30; m++) {
    Logger.log("  Merged: " + merged[m].getA1Notation());
  }
  
  // Check print area / named ranges
  var named = ss.getNamedRanges();
  Logger.log("Named ranges: " + named.length);
  for (var n = 0; n < named.length; n++) {
    Logger.log("  Named: " + named[n].getName() + " → " + named[n].getRange().getA1Notation());
  }
  
  Logger.log("=== DIAGNOSTIC COMPLETE ===");
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
  
  Logger.log("=== SETUP COMPLETE ===");
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
    
    // Extract model + variant
    var rawVariant = getFieldValue(nv, FORM_FIELDS.VARIANT);
    Logger.log("Raw Variant: " + rawVariant);
    
    var model = "";
    var variant = "";
    if (rawVariant && rawVariant.indexOf(" - ") > 0) {
      var parts = rawVariant.split(" - ");
      model = parts[0].trim();
      variant = parts[1].trim();
    }
    Logger.log("Parsed → model: " + model + " | variant: " + variant);
    
    // Look up vehicle
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
      Logger.log("WARNING: No vehicle match for '" + model + "' '" + variant + "'");
    }
    
    var insurance = vehicle ? calcInsurance(vehicle.rrp) : 0;
    
    // Build ALL replacements - ONLY TextFinder, no hardcoded cells
    var replacements = {
      "{{CUSTOMER NAME}}":     getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME) || "",
      "{{CUSTOMER ADDRESS}}":  getFieldValue(nv, FORM_FIELDS.ADDRESS) || "",
      "{{CUSTOMER IC}}":       getFieldValue(nv, FORM_FIELDS.IC_NUMBER) || "",
      "{{CUSTOMER PHONE}}":    getFieldValue(nv, FORM_FIELDS.PHONE_NUMBER) || "",
      "{{CUSTOMER EMAIL}}":    getFieldValue(nv, FORM_FIELDS.EMAIL) || "",
      "{{MODEL}}":             (model + " " + variant).trim(),
      "{{COLOR}}":             getFieldValue(nv, FORM_FIELDS.COLOUR) || "",
      "{{CHASSIS}}":           getFieldValue(nv, FORM_FIELDS.CHASSIS) || "",
      "{{ENGINE}}":            getFieldValue(nv, FORM_FIELDS.ENGINE) || "",
      "{{YM}}":                getFieldValue(nv, FORM_FIELDS.YEAR_MAKE) || "",
      "{{DATE}}":              formatDate(new Date()),
      "{{BODYPRICE}}":         vehicle ? String(vehicle.rrp) : "",
      "{{B2}}":                vehicle ? String(vehicle.b2Fee) : "",
      "{{EVPLATE}}":           vehicle ? String(vehicle.evPlate) : "",
      "{{REGFEE}}":            vehicle ? String(vehicle.regFee) : "",
      "{{ROADTAX}}":           vehicle ? String(vehicle.roadTax) : "",
      "{{INSURANCE}}":         vehicle ? String(insurance) : "",
      "{{LOANAMOUNT}}":        getFieldValue(nv, FORM_FIELDS.LOAN_AMOUNT) || "",
      "{{TENURE}}":            getFieldValue(nv, FORM_FIELDS.LOAN_PERIOD) || ""
    };
    
    // Log all replacements for debugging
    Logger.log("--- REPLACEMENTS ---");
    for (var ph in replacements) {
      Logger.log("  " + ph + " → [" + replacements[ph] + "]");
    }
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    Logger.log("Template copied. Sheet: " + rcoSheet.getName() + " ID: " + rcoSheet.getSheetId());
    
    // Step 2: Replace ALL placeholders via TextFinder
    Logger.log("--- Replacing placeholders ---");
    for (var placeholder in replacements) {
      try {
        var value = String(replacements[placeholder]);
        if (!value || value === "") {
          Logger.log("SKIP (empty): " + placeholder);
          continue;
        }
        var tf = rcoSheet.createTextFinder(placeholder);
        var count = tf.replaceAllWith(value);
        Logger.log("REPLACE: " + placeholder + " → [" + value + "] matches=" + count);
      } catch (tfErr) {
        Logger.log("ERROR replacing " + placeholder + ": " + tfErr.toString());
      }
    }
    
    // Step 3: Set left alignment on all data cells
    try {
      var dataRange = rcoSheet.getDataRange();
      dataRange.setHorizontalAlignment("left");
      Logger.log("Alignment set to left for " + dataRange.getA1Notation());
    } catch (alignErr) {
      Logger.log("Alignment failed: " + alignErr.toString());
    }
    
    // Step 4: Generate PDF — minimal params, let template handle layout
    var pdfFile = generatePDF(copySS, rcoSheet, getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME));
    Logger.log("PDF created: " + pdfFile.getUrl());
    
    // Step 5: Clean up draft
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
  
  // Minimal PDF params — no invalid params, no range restriction
  // fitw=true = fit all columns into page width
  // portrait = true (RCO is a portrait form)
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf" +
    "&gid=" + sheetId +
    "&size=A4" +
    "&portrait=true" +
    "&fitw=true" +
    "&gridlines=false" +
    "&printnotes=false" +
    "&printtitle=false" +
    "&fzr=false" +
    "&top_margin=0.25" +
    "&bottom_margin=0.25" +
    "&left_margin=0.25" +
    "&right_margin=0.25";
  
  Logger.log("PDF URL params set");
  
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
  
  var pdfBlob = response.getBlob().setName("RCO_" + (customerName || "Customer") + "_" + formatDate(new Date()) + ".pdf");
  var folderId = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var pdfFile = folder.createFile(pdfBlob);
  Logger.log("PDF: " + pdfFile.getName() + " (" + pdfFile.getSize() + " bytes)");
  return pdfFile;
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

// Manual test
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
      "Sales Advisor": "Ridzuan",
      "Remarks": "Test"
    }
  };
  onFormSubmit(e);
}
