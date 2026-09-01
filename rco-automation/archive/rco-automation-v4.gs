/**
 * BYD RCO AUTOMATION - v4.0
 * 
 * Key fixes:
 *   1. PDF: landscape A4, fitw=true, exact content range, minimal margins → single page
 *   2. NO DB lookups - use VEHICLE_DATA directly (no more PENDING_REVIEW)
 *   3. {{BODYPRICE}} = RRP (selling price WITHOUT insurance, WITHOUT fees)
 *   4. Model name auto-extracted from Variant dropdown
 *   5. Variant dropdown at top of Vehicle Details
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

// Direct vehicle data - NO DB lookups needed
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

// === SETUP ===
function setupRCOAutomation() {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  var folders = DriveApp.getFoldersByName(CONFIG.OUTPUT_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.OUTPUT_FOLDER_NAME);
  PropertiesService.getScriptProperties().setProperty("OUTPUT_FOLDER_ID", folder.getId());
  
  // Create LOGS sheet only (no DB sheets needed anymore)
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
      // Move to before Colour
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
    if (!e || !e.namedValues) { logError("No form data", "ALL", "e.namedValues null"); return; }
    
    var nv = e.namedValues;
    
    // Log all keys for debugging
    var keys = Object.keys(nv);
    Logger.log("Keys: " + keys.join(", "));
    
    // Extract model + variant from the single dropdown
    var rawVariant = getFieldValue(nv, FORM_FIELDS.VARIANT);
    Logger.log("Raw Variant: " + rawVariant);
    
    var model = "";
    var variant = "";
    if (rawVariant && rawVariant.indexOf(" - ") > 0) {
      var parts = rawVariant.split(" - ");
      model = parts[0].trim();
      variant = parts[1].trim();
    }
    Logger.log("Model: " + model + " | Variant: " + variant);
    
    // Look up vehicle data DIRECTLY from VEHICLE_DATA (no DB)
    var vehicle = null;
    for (var i = 0; i < VEHICLE_DATA.length; i++) {
      if (VEHICLE_DATA[i].model.toLowerCase() === model.toLowerCase() &&
          VEHICLE_DATA[i].variant.toLowerCase() === variant.toLowerCase()) {
        vehicle = VEHICLE_DATA[i];
        break;
      }
    }
    
    if (!vehicle) {
      Logger.log("WARNING: Vehicle not found in VEHICLE_DATA for " + model + " " + variant);
      logError("Vehicle not found", "VEHICLE", model + " " + variant);
    } else {
      Logger.log("Vehicle found: rrp=" + vehicle.rrp + " roadTax=" + vehicle.roadTax);
    }
    
    var formData = {
      customerName:    getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME),
      customerIC:      getFieldValue(nv, FORM_FIELDS.IC_NUMBER),
      customerPhone:   getFieldValue(nv, FORM_FIELDS.PHONE_NUMBER),
      customerEmail:   getFieldValue(nv, FORM_FIELDS.EMAIL),
      customerAddress: getFieldValue(nv, FORM_FIELDS.ADDRESS),
      model:           model,
      variant:         variant,
      colour:          getFieldValue(nv, FORM_FIELDS.COLOUR),
      chassis:         getFieldValue(nv, FORM_FIELDS.CHASSIS),
      engine:          getFieldValue(nv, FORM_FIELDS.ENGINE),
      regNo:           getFieldValue(nv, FORM_FIELDS.REG_NO),
      yearMake:        getFieldValue(nv, FORM_FIELDS.YEAR_MAKE),
      loanAmount:      getFieldValue(nv, FORM_FIELDS.LOAN_AMOUNT),
      loanPeriod:      getFieldValue(nv, FORM_FIELDS.LOAN_PERIOD),
      downpayment:     getFieldValue(nv, FORM_FIELDS.DOWNPAYMENT),
      tradeIn:         getFieldValue(nv, FORM_FIELDS.TRADE_IN),
      salesAdvisor:    getFieldValue(nv, FORM_FIELDS.SALES_ADVISOR),
      remarks:         getFieldValue(nv, FORM_FIELDS.REMARKS)
    };
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    Logger.log("Template copied: " + rcoSheet.getName());
    
    // Step 2: Build replacements using VEHICLE_DATA directly
    // {{BODYPRICE}} = RRP = selling price WITHOUT insurance and WITHOUT fees
    var replacements = {
      "{{CUSTOMER NAME}}":    formData.customerName || "",
      "{{CUSTOMER ADDRESS}}": formData.customerAddress || "",
      "{{CUSTOMER IC}}":      formData.customerIC || "",
      "{{CUSTOMER PHONE}}":   formData.customerPhone || "",
      "{{CUSTOMER EMAIL}}":   formData.customerEmail || "",
      "{{MODEL}}":            formData.model || "",
      "{{COLOR}}":            formData.colour || "",
      "{{CHASSIS}}":          formData.chassis || "",
      "{{ENGINE}}":           formData.engine || "",
      "{{YM}}":               formData.yearMake || "",
      "{{DATE}}":             formatDate(new Date()),
      "{{BODYPRICE}}":        vehicle ? String(vehicle.rrp) : "",
      "{{B2}}":               vehicle ? String(vehicle.b2Fee) : "",
      "{{EVPLATE}}":          vehicle ? String(vehicle.evPlate) : "",
      "{{REGFEE}}":           vehicle ? String(vehicle.regFee) : "",
      "{{ROADTAX}}":          vehicle ? String(vehicle.roadTax) : "",
      "{{INSURANCE}}":        vehicle ? String(calcInsurance(vehicle.rrp)) : "",
      "{{LOANAMOUNT}}":       formData.loanAmount || "",
      "{{TENURE}}":           String(formData.loanPeriod || "")
    };
    
    Logger.log("Replacements: " + JSON.stringify(replacements));
    
    // Step 3: Populate placeholders
    for (var placeholder in replacements) {
      rcoSheet.createTextFinder(placeholder).replaceAllWith(String(replacements[placeholder]));
      Logger.log("Replaced " + placeholder + " = " + replacements[placeholder]);
    }
    
    // Step 4: Generate PDF - single A4 page, landscape, left-aligned
    var pdfFile = generatePDF(copySS, rcoSheet, formData.customerName);
    Logger.log("PDF: " + pdfFile.getUrl());
    
    // Step 5: Clean up
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("=== RCO COMPLETE: " + formData.customerName + " ===");
    
  } catch (err) {
    Logger.log("ERROR: " + err.toString());
    Logger.log("STACK: " + err.stack);
    logError(err.toString(), "CATCH", err.stack);
  }
}

// Insurance calc from price tier (from bydmiri-data/insurance rules)
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

// PDF: landscape A4, fit width, exact content range, minimal margins, left-aligned
function generatePDF(spreadsheet, sheet, customerName) {
  var sheetId = sheet.getSheetId();
  var ssId = spreadsheet.getId();
  
  // Find actual content range
  var lastRow = sheet.getDataRange().getLastRow();
  var lastCol = sheet.getDataRange().getLastColumn();
  
  // Convert column number to letter
  var colLetter = columnToLetter(lastCol);
  var range = "A1:" + colLetter + lastRow;
  
  Logger.log("Content range: " + range + " (rows=" + lastRow + ", cols=" + lastCol + ")");
  
  // Build PDF URL - landscape A4, fit to width, left-aligned, minimal margins
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf" +
    "&gid=" + sheetId +
    "&size=A4" +
    "&orientation=landscape" +      // landscape for wide form
    "&fitw=true" +                  // fit all columns to page width
    "&gridlines=false" +
    "&printnotes=false" +
    "&sheetnotes=false" +
    "&printtitle=false" +
    "&fzr=false" +
    "&fzc=false" +
    "&horizontal_alignment=left" +  // left-aligned content
    "&vertical_alignment=middle" +
    "&top_margin=0.25" +            // minimal margins
    "&bottom_margin=0.25" +
    "&left_margin=0.25" +
    "&right_margin=0.25" +
    "&range=" + encodeURIComponent(range);  // exact content range only
  
  Logger.log("PDF URL built with range=" + range + " landscape A4");
  
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    logError("PDF failed", "PDF", "HTTP " + response.getResponseCode());
    throw new Error("PDF failed: HTTP " + response.getResponseCode());
  }
  
  var pdfBlob = response.getBlob().setName("RCO_" + (customerName || "Customer") + "_" + formatDate(new Date()) + ".pdf");
  var folderId = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var pdfFile = folder.createFile(pdfBlob);
  Logger.log("PDF created: " + pdfFile.getName() + " (" + pdfFile.getSize() + " bytes)");
  return pdfFile;
}

// Convert column number to letter (1=A, 27=AA, etc)
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
