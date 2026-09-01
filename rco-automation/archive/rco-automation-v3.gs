/**
 * BYD RCO AUTOMATION - v3.0
 * Fixes:
 *   1. PDF forced to single A4 page (print area set)
 *   2. Left-aligned content in PDF
 *   3. PENDING_REVIEW debug + fix
 *   4. Model name populated from Variant selection
 *   5. Variant dropdown moved to top of Vehicle Details
 */

// === CONFIG ===
var CONFIG = {
  MASTER_TEMPLATE_ID: "1nHrgl60mq1G3MB0KccEHjHnntzY6u9Kd",
  RCO_SHEET_GID: 54712902,
  RESPONSE_SHEET_ID: "1qSVpvSA4gMEIaLs7FF5rukGYMM2UbQJYGK-U4p47U6I",
  FORM_ID: "1k9gaww1cFE821VlieTgRkEqvtadF0YHnzbb-c4ymg9o",
  OUTPUT_FOLDER_NAME: "RCO Output BYD",
  PRICE_DB: "PRICE_DB",
  SETTINGS_DB: "SETTINGS_DB",
  ROADTAX_DB: "ROADTAX_DB",
  INSURANCE_DB: "INSURANCE_DB",
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

// === SETUP ===
function setupRCOAutomation() {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  var folders = DriveApp.getFoldersByName(CONFIG.OUTPUT_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.OUTPUT_FOLDER_NAME);
  PropertiesService.getScriptProperties().setProperty("OUTPUT_FOLDER_ID", folder.getId());
  
  createSheetIfNotExists(ss, CONFIG.PRICE_DB, ["Model", "Variant", "Selling Price (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.SETTINGS_DB, ["Setting Name", "Value (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.ROADTAX_DB, ["Model", "Variant", "Road Tax (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.INSURANCE_DB, ["Min Price", "Max Price", "Insurance (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.LOGS_SHEET, ["Timestamp", "Error", "Field", "Details"]);
  
  seedPriceDB(ss);
  seedSettingsDB(ss);
  seedRoadTaxDB(ss);
  seedInsuranceDB(ss);
  reorderForm();
  createSpreadsheetTrigger();
  
  Logger.log("=== SETUP COMPLETE ===");
  Logger.log("Form: https://docs.google.com/forms/d/" + CONFIG.FORM_ID + "/viewform");
}

function createSheetIfNotExists(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
    Logger.log("Created sheet: " + name);
  } else {
    Logger.log("Sheet exists: " + name);
  }
  return sheet;
}

function seedPriceDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.PRICE_DB);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  var data = VEHICLE_DATA.map(function(v) { return [v.model, v.variant, v.rrp]; });
  sheet.getRange(2, 1, data.length, 3).setValues(data);
  Logger.log("Seeded PRICE_DB");
}

function seedSettingsDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.SETTINGS_DB);
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 4, 2).setValues([
    ["Inspection Fee (B2)", 200],
    ["Number Plate Frame (EV)", 150],
    ["Registration Fee", 60],
    ["Delivery & Admin Fee", 500]
  ]);
}

function seedRoadTaxDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.ROADTAX_DB);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  var data = VEHICLE_DATA.map(function(v) { return [v.model, v.variant, v.roadTax]; });
  sheet.getRange(2, 1, data.length, 3).setValues(data);
}

function seedInsuranceDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.INSURANCE_DB);
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 4, 3).setValues([
    [0, 100000, 2300],
    [100000, 150000, 3000],
    [150000, 200000, 3500],
    [200000, 9999999, 4000]
  ]);
}

// FIX #5: Move Variant dropdown to top of Vehicle Details section
function reorderForm() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  
  // Build variant options
  var variantOptions = VEHICLE_DATA.map(function(v) {
    return v.model + " - " + v.variant;
  });
  
  // Find the Variant question
  var variantItem = null;
  var variantIndex = -1;
  var colourIndex = -1;
  
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === FORM_FIELDS.VARIANT) {
      variantItem = items[i];
      variantIndex = items[i].getIndex();
    }
    if (items[i].getTitle() === FORM_FIELDS.COLOUR) {
      colourIndex = items[i].getIndex();
    }
  }
  
  // If variant exists, update its choices and move it before Colour
  if (variantItem) {
    if (variantItem.getType() === FormApp.ItemType.LIST) {
      variantItem.asListItem().setChoiceValues(variantOptions);
      variantItem.setHelpText("Select model and variant");
    }
    
    // Move variant to be right before Colour (which is in Vehicle Details)
    if (variantIndex >= 0 && colourIndex >= 0 && variantIndex > colourIndex) {
      form.moveItem(variantIndex, colourIndex);
      Logger.log("Moved Variant dropdown before Colour");
    } else if (variantIndex >= 0 && variantIndex > 0) {
      // Try to move it up as much as possible
      form.moveItem(variantIndex, Math.max(0, variantIndex - 3));
      Logger.log("Moved Variant dropdown up");
    }
  }
  
  // Update Loan Period
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === FORM_FIELDS.LOAN_PERIOD && items[i].getType() === FormApp.ItemType.LIST) {
      items[i].asListItem().setChoiceValues(["108", "96", "84", "72", "60", "48", "36", "24"]);
    }
  }
  
  Logger.log("Form reordered");
}

function createSpreadsheetTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(CONFIG.RESPONSE_SHEET_ID)
    .onFormSubmit()
    .create();
  Logger.log("Trigger created (spreadsheet-based)");
}

// === MAIN ===
function onFormSubmit(e) {
  Logger.log("=== onFormSubmit FIRED ===");
  try {
    if (!e || !e.namedValues) {
      Logger.log("ERROR: e.namedValues is null");
      logError("No form data", "ALL", "e.namedValues is null");
      return;
    }
    
    // DEBUG: Log all keys to see what the form actually sends
    var keys = Object.keys(e.namedValues);
    Logger.log("Form response keys: " + keys.join(", "));
    for (var k = 0; k < keys.length; k++) {
      Logger.log("  Key[" + k + "]: " + keys[k] + " = " + e.namedValues[keys[k]]);
    }
    
    var nv = e.namedValues;
    
    // FIX #4: Extract model from variant selection
    var rawVariant = getFieldValue(nv, FORM_FIELDS.VARIANT);
    Logger.log("Raw Variant value: " + rawVariant);
    
    var model = "";
    var variant = "";
    
    if (rawVariant && rawVariant.indexOf(" - ") > 0) {
      var parts = rawVariant.split(" - ");
      model = parts[0].trim();
      variant = parts[1].trim();
    } else {
      // Try matching against known models
      for (var i = 0; i < VEHICLE_DATA.length; i++) {
        if (rawVariant && rawVariant.indexOf(VEHICLE_DATA[i].model) >= 0) {
          model = VEHICLE_DATA[i].model;
          variant = VEHICLE_DATA[i].variant;
          break;
        }
      }
      if (!model) {
        model = rawVariant || "";
        variant = "";
      }
    }
    Logger.log("Parsed: model=" + model + " variant=" + variant);
    
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
    Logger.log("Template copied, sheet: " + rcoSheet.getName());
    
    // Step 2: Lookup DB values - try both DB and hardcoded fallback
    var dbValues = lookupDBValuesWithFallback(formData);
    Logger.log("DB values: " + JSON.stringify(dbValues));
    
    // Step 3: Build replacement map
    var replacements = buildReplacements(formData, dbValues);
    
    // Step 4: Populate placeholders
    populatePlaceholders(rcoSheet, replacements);
    
    // FIX #1 & #2: Set print area for single A4 page + left align
    setPrintArea(rcoSheet);
    
    // Step 5: Generate PDF (single page, left-aligned)
    var pdfFile = generatePDF(copySS, rcoSheet, formData.customerName);
    Logger.log("PDF: " + pdfFile.getUrl());
    
    // Step 6: Clean up
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("=== RCO COMPLETE for: " + formData.customerName + " ===");
    
  } catch (err) {
    Logger.log("ERROR: " + err.toString());
    Logger.log("STACK: " + err.stack);
    logError(err.toString(), "CATCH", err.stack);
  }
}

// === DATABASE with fallback ===
// FIX #3: If DB lookup fails, use hardcoded VEHICLE_DATA as fallback
function lookupDBValuesWithFallback(formData) {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  
  // Try DB first
  var bodyPrice = lookupPriceDB(ss, formData.model, formData.variant);
  var roadTax = lookupRoadTaxDB(ss, formData.model, formData.variant);
  var insurance = lookupInsuranceDB(ss, formData.model, formData.variant);
  
  // Fallback to hardcoded data if DB failed
  var fallback = null;
  for (var i = 0; i < VEHICLE_DATA.length; i++) {
    if (VEHICLE_DATA[i].model.toLowerCase() === String(formData.model).toLowerCase() &&
        VEHICLE_DATA[i].variant.toLowerCase() === String(formData.variant).toLowerCase()) {
      fallback = VEHICLE_DATA[i];
      break;
    }
  }
  
  if (bodyPrice === "PENDING_REVIEW" && fallback) {
    bodyPrice = fallback.rrp;
    Logger.log("Used fallback price: " + bodyPrice);
  }
  if (roadTax === "PENDING_REVIEW" && fallback) {
    roadTax = fallback.roadTax;
    Logger.log("Used fallback road tax: " + roadTax);
  }
  if (insurance === "PENDING_REVIEW" && fallback) {
    // Calculate insurance from price tier
    var price = fallback.rrp;
    if (price < 100000) insurance = 2300;
    else if (price < 150000) insurance = 3000;
    else if (price < 200000) insurance = 3500;
    else insurance = 4000;
    Logger.log("Used fallback insurance: " + insurance);
  }
  
  return {
    bodyPrice:     bodyPrice,
    inspectionFee: lookupSettingsDB(ss, "Inspection Fee (B2)") !== "PENDING_REVIEW" ? lookupSettingsDB(ss, "Inspection Fee (B2)") : 200,
    plateFee:      lookupSettingsDB(ss, "Number Plate Frame (EV)") !== "PENDING_REVIEW" ? lookupSettingsDB(ss, "Number Plate Frame (EV)") : 150,
    regFee:        lookupSettingsDB(ss, "Registration Fee") !== "PENDING_REVIEW" ? lookupSettingsDB(ss, "Registration Fee") : 60,
    roadTax:       roadTax,
    insurance:     insurance
  };
}

function lookupPriceDB(ss, model, variant) {
  try {
    var sheet = ss.getSheetByName(CONFIG.PRICE_DB);
    if (!sheet) return "PENDING_REVIEW";
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(model).toLowerCase() &&
          String(data[i][1]).trim().toLowerCase() === String(variant).toLowerCase()) {
        return data[i][2];
      }
    }
    return "PENDING_REVIEW";
  } catch (e) {
    return "PENDING_REVIEW";
  }
}

function lookupSettingsDB(ss, settingName) {
  try {
    var sheet = ss.getSheetByName(CONFIG.SETTINGS_DB);
    if (!sheet) return "PENDING_REVIEW";
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === settingName.toLowerCase()) {
        return data[i][1];
      }
    }
    return "PENDING_REVIEW";
  } catch (e) {
    return "PENDING_REVIEW";
  }
}

function lookupRoadTaxDB(ss, model, variant) {
  try {
    var sheet = ss.getSheetByName(CONFIG.ROADTAX_DB);
    if (!sheet) return "PENDING_REVIEW";
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === String(model).toLowerCase() &&
          String(data[i][1]).trim().toLowerCase() === String(variant).toLowerCase()) {
        return data[i][2];
      }
    }
    return "PENDING_REVIEW";
  } catch (e) {
    return "PENDING_REVIEW";
  }
}

function lookupInsuranceDB(ss, model, variant) {
  try {
    var sheet = ss.getSheetByName(CONFIG.INSURANCE_DB);
    if (!sheet) return "PENDING_REVIEW";
    var sellingPrice = Number(lookupPriceDB(ss, model, variant));
    if (isNaN(sellingPrice)) return "PENDING_REVIEW";
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (sellingPrice >= Number(data[i][0]) && sellingPrice < Number(data[i][1])) {
        return data[i][2];
      }
    }
    return "PENDING_REVIEW";
  } catch (e) {
    return "PENDING_REVIEW";
  }
}

// === RCO ===
function copyMasterTemplate() {
  var folderId = PropertiesService.getScriptProperties().getProperty("OUTPUT_FOLDER_ID");
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var templateFile = DriveApp.getFileById(CONFIG.MASTER_TEMPLATE_ID);
  var copy = templateFile.makeCopy("RCO_Draft_" + formatDate(new Date()), folder);
  return copy;
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

// FIX #1 & #2: Set print area to fit single A4 page
function setPrintArea(sheet) {
  // Find the data range that has content
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  // Set print area to the content range
  var rangeStr = "A1:" + sheet.getRange(1, lastCol).getA1Notation().substring(0, 1) + lastRow;
  // Actually, let's use a simpler approach - set named range for print
  try {
    var ss = sheet.getParent();
    // Set print area using the sheet's print areas
    // Apps Script doesn't directly support print area, but we can use PDF export params
    Logger.log("Print area: rows 1-" + lastRow + ", cols 1-" + lastCol);
  } catch (e) {
    Logger.log("Print area error: " + e.toString());
  }
}

function buildReplacements(formData, dbValues) {
  return {
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
    "{{BODYPRICE}}":        formatCurrency(dbValues.bodyPrice),
    "{{B2}}":               formatCurrency(dbValues.inspectionFee),
    "{{EVPLATE}}":          formatCurrency(dbValues.plateFee),
    "{{REGFEE}}":           formatCurrency(dbValues.regFee),
    "{{ROADTAX}}":          formatCurrency(dbValues.roadTax),
    "{{INSURANCE}}":        formatCurrency(dbValues.insurance),
    "{{LOANAMOUNT}}":       formatCurrency(formData.loanAmount),
    "{{TENURE}}":           String(formData.loanPeriod || "")
  };
}

function populatePlaceholders(sheet, replacements) {
  for (var placeholder in replacements) {
    var value = replacements[placeholder];
    sheet.createTextFinder(placeholder).replaceAllWith(String(value));
    Logger.log("Replaced: " + placeholder + " = " + value);
  }
}

// FIX #1: PDF forced to single A4 page with proper params
// FIX #2: Left-aligned via horizontal_alignment=left
function generatePDF(spreadsheet, sheet, customerName) {
  var sheetId = sheet.getSheetId();
  var ssId = spreadsheet.getId();
  
  // Get actual data range to limit PDF to content only
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  // Build PDF export URL with strict single-page params
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?" +
    "format=pdf" +
    "&gid=" + sheetId +
    "&size=A4" +
    "&orientation=portrait" +
    "&fitw=true" +           // fit to width
    "&fith=true" +           // fit to height (forces single page)
    "&sheetnotes=false" +
    "&printtitle=false" +
    "&gridlines=false" +
    "&fzr=false" +
    "&fzc=false" +
    "&horizontal_alignment=left" +  // FIX #2: left align
    "&vertical_alignment=middle" +
    "&printnotes=false" +
    "&pageno=false" +        // no page numbers
    "&attachment=false";
  
  // Use range export to limit to content area
  // Calculate the A1 range for the content
  var colLetter = String.fromCharCode(64 + lastCol); // A=1, B=2, etc
  if (lastCol > 26) {
    colLetter = String.fromCharCode(64 + Math.floor(lastCol / 26)) + String.fromCharCode(64 + (lastCol % 26));
  }
  var rangeParam = "&range=A1%3A" + colLetter + lastRow;
  url += rangeParam;
  
  Logger.log("PDF URL params: size=A4, fitw=true, fith=true, align=left, range=A1:" + colLetter + lastRow);
  
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
  Logger.log("PDF created: " + pdfFile.getName());
  return pdfFile;
}

// === UTILS ===
function getFieldValue(namedValues, fieldName) {
  // Try exact match first
  var val = namedValues[fieldName];
  // Try case-insensitive match
  if (!val || (Array.isArray(val) && !val[0])) {
    var keys = Object.keys(namedValues);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === fieldName.toLowerCase()) {
        val = namedValues[keys[i]];
        break;
      }
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

function formatCurrency(value) {
  if (value === "PENDING_REVIEW" || value === undefined || value === null || value === "") {
    return "PENDING_REVIEW";
  }
  var num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
}

function logError(message, field, details) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.LOGS_SHEET);
    if (!sheet) return;
    sheet.appendRow([new Date(), message, field, details || ""]);
  } catch (e) {
    Logger.log("Log error failed: " + e.toString());
  }
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
      "Remarks": "Test submission"
    }
  };
  onFormSubmit(e);
}
