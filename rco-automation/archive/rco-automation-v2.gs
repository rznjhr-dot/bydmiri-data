/**
 * BYD RCO AUTOMATION - v2.1
 * Fixes: spreadsheet trigger (not form trigger) + single Variant dropdown
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
  updateFormVariantDropdown();
  createSpreadsheetTrigger();
  
  Logger.log("=== SETUP COMPLETE ===");
  Logger.log("Output Folder: " + folder.getUrl());
  Logger.log("DBs: " + ss.getUrl());
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
    Logger.log("Sheet already exists: " + name);
  }
  return sheet;
}

function seedPriceDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.PRICE_DB);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  var data = VEHICLE_DATA.map(function(v) { return [v.model, v.variant, v.rrp]; });
  sheet.getRange(2, 1, data.length, 3).setValues(data);
  Logger.log("Seeded PRICE_DB with " + data.length + " entries");
}

function seedSettingsDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.SETTINGS_DB);
  if (sheet.getLastRow() > 1) return;
  var defaults = [
    ["Inspection Fee (B2)", 200],
    ["Number Plate Frame (EV)", 150],
    ["Registration Fee", 60],
    ["Delivery & Admin Fee", 500]
  ];
  sheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
  Logger.log("Seeded SETTINGS_DB");
}

function seedRoadTaxDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.ROADTAX_DB);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  var data = VEHICLE_DATA.map(function(v) { return [v.model, v.variant, v.roadTax]; });
  sheet.getRange(2, 1, data.length, 3).setValues(data);
  Logger.log("Seeded ROADTAX_DB with " + data.length + " entries");
}

function seedInsuranceDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.INSURANCE_DB);
  if (sheet.getLastRow() > 1) return;
  var tiers = [
    [0, 100000, 2300],
    [100000, 150000, 3000],
    [150000, 200000, 3500],
    [200000, 9999999, 4000]
  ];
  sheet.getRange(2, 1, tiers.length, 3).setValues(tiers);
  Logger.log("Seeded INSURANCE_DB");
}

function updateFormVariantDropdown() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  
  // Build variant options "BYD Atto 3 - Ultra" etc
  var variantOptions = VEHICLE_DATA.map(function(v) {
    return v.model + " - " + v.variant;
  });
  
  // Find and delete the old "Model" question
  var modelIndex = -1;
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === "Model") {
      modelIndex = items[i].getIndex();
      form.deleteItem(modelIndex);
      Logger.log("Deleted old Model dropdown");
      break;
    }
  }
  
  // Refresh items after deletion
  items = form.getItems();
  
  // Find the Variant question and update it
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === FORM_FIELDS.VARIANT) {
      if (items[i].getType() === FormApp.ItemType.LIST) {
        items[i].asListItem().setChoiceValues(variantOptions);
        items[i].setHelpText("Select model and variant");
        Logger.log("Updated Variant dropdown with " + variantOptions.length + " options");
      } else if (items[i].getType() === FormApp.ItemType.TEXT) {
        // Convert text to list
        var idx = items[i].getIndex();
        form.deleteItem(idx);
        var newItem = form.addListItem();
        newItem.setTitle(FORM_FIELDS.VARIANT).setHelpText("Select model and variant");
        newItem.setChoiceValues(variantOptions);
        Logger.log("Converted Variant from text to dropdown with " + variantOptions.length + " options");
      }
    }
    
    // Update Loan Period
    if (items[i].getTitle() === FORM_FIELDS.LOAN_PERIOD) {
      if (items[i].getType() === FormApp.ItemType.LIST) {
        items[i].asListItem().setChoiceValues(["108", "96", "84", "72", "60", "48", "36", "24"]);
      }
    }
  }
}

// FIX: Use SPREADSHEET trigger instead of FORM trigger
// Spreadsheet triggers give e.namedValues; form triggers give e.response
function createSpreadsheetTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Use forSpreadsheet instead of forForm!
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(CONFIG.RESPONSE_SHEET_ID)
    .onFormSubmit()
    .create();
  Logger.log("Trigger created: onFormSubmit (spreadsheet-based)");
}

// === MAIN - onFormSubmit handler ===
function onFormSubmit(e) {
  Logger.log("=== onFormSubmit FIRED ===");
  try {
    if (!e || !e.namedValues) {
      Logger.log("ERROR: e.namedValues is null. Trigger type may be wrong.");
      logError("No form data", "ALL", "e.namedValues is null - check trigger type");
      return;
    }
    
    Logger.log("Form data received: " + JSON.stringify(e.namedValues));
    
    var nv = e.namedValues;
    
    var formData = {
      customerName:    getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME),
      customerIC:      getFieldValue(nv, FORM_FIELDS.IC_NUMBER),
      customerPhone:   getFieldValue(nv, FORM_FIELDS.PHONE_NUMBER),
      customerEmail:   getFieldValue(nv, FORM_FIELDS.EMAIL),
      customerAddress: getFieldValue(nv, FORM_FIELDS.ADDRESS),
      model:           "",
      variant:         getFieldValue(nv, FORM_FIELDS.VARIANT),
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
    
    // Split "BYD Atto 3 - Ultra" into model + variant
    if (formData.variant && formData.variant.indexOf(" - ") > 0) {
      var parts = formData.variant.split(" - ");
      formData.model = parts[0].trim();
      formData.variant = parts[1].trim();
    }
    
    Logger.log("Parsed: model=" + formData.model + " variant=" + formData.variant);
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    Logger.log("Template copied, RCO sheet found: " + rcoSheet.getName());
    
    // Step 2: Lookup DB values
    var dbValues = lookupDBValues(formData);
    Logger.log("DB values: " + JSON.stringify(dbValues));
    
    // Step 3: Build replacement map
    var replacements = buildReplacements(formData, dbValues);
    Logger.log("Replacements built");
    
    // Step 4: Populate all placeholders via TextFinder
    populatePlaceholders(rcoSheet, replacements);
    Logger.log("Placeholders populated");
    
    // Step 5: Generate PDF
    var pdfFile = generatePDF(copySS, rcoSheet, formData.customerName);
    Logger.log("PDF generated: " + pdfFile.getUrl());
    
    // Step 6: Clean up - delete the sheet copy (keep only PDF)
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("Draft sheet trashed, PDF kept.");
    
    Logger.log("=== RCO COMPLETE for: " + formData.customerName + " ===");
    
  } catch (err) {
    Logger.log("ERROR: " + err.toString());
    Logger.log("STACK: " + err.stack);
    logError(err.toString(), "CATCH", err.stack);
  }
}

// === DATABASE ===
function lookupDBValues(formData) {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  return {
    bodyPrice:     lookupPriceDB(ss, formData.model, formData.variant),
    inspectionFee: lookupSettingsDB(ss, "Inspection Fee (B2)"),
    plateFee:      lookupSettingsDB(ss, "Number Plate Frame (EV)"),
    regFee:        lookupSettingsDB(ss, "Registration Fee"),
    roadTax:       lookupRoadTaxDB(ss, formData.model, formData.variant),
    insurance:     lookupInsuranceDB(ss, formData.model, formData.variant)
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
    logError("Price not found", "BODYPRICE", "Model: " + model + ", Variant: " + variant);
    return "PENDING_REVIEW";
  } catch (e) {
    logError(e.toString(), "BODYPRICE", "lookupPriceDB failed");
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
      var minVal = Number(data[i][0]);
      var maxVal = Number(data[i][1]);
      if (sellingPrice >= minVal && sellingPrice < maxVal) {
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
  Logger.log("Template copied: " + copy.getName());
  return copy;
}

function getRCOSheet(spreadsheet) {
  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === CONFIG.RCO_SHEET_GID) return sheets[i];
  }
  var byName = spreadsheet.getSheetByName("RCO");
  if (byName) return byName;
  Logger.log("Warning: RCO sheet not found by GID, using first sheet");
  return sheets[0];
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

function generatePDF(spreadsheet, sheet, customerName) {
  var sheetId = sheet.getSheetId();
  var ssId = spreadsheet.getId();
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?" +
    "format=pdf&gid=" + sheetId +
    "&size=A4&orientation=portrait&fitw=true" +
    "&sheetnotes=false&printtitle=false&gridlines=false" +
    "&fzr=false&fzc=false";
  
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    logError("PDF generation failed", "PDF", "HTTP " + response.getResponseCode());
    throw new Error("PDF generation failed: HTTP " + response.getResponseCode());
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
  var val = namedValues[fieldName];
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

function formatDate(date) {
  var d = date;
  var dd = String(d.getDate()).padStart(2, "0");
  var mm = String(d.getMonth() + 1).padStart(2, "0");
  var yy = String(d.getFullYear()).substring(2);
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
    Logger.log("Failed to log error: " + e.toString());
  }
}

// Manual test function - simulates a form submission
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
