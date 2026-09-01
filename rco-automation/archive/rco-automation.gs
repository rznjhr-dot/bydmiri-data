/**
 * ============================================
 * BYD RCO AUTOMATION - COMPLETE APPS SCRIPT
 * ============================================
 * Version: 2.0 - with real data from bydmiri-data
 * 
 * Sections:
 *   1. CONFIG - all IDs and constants
 *   2. SETUP - one-time setup (updates form + creates DB sheets + trigger)
 *   3. MAIN - onFormSubmit handler
 *   4. DATABASE - lookup functions
 *   5. RCO - copy template + populate + PDF
 *   6. UTILS - helpers
 * 
 * TO USE:
 *   1. Run setupRCOAutomation() once
 *   2. Fill the Google Form - RCO auto-generates
 * ============================================
 */

// ============================================
// 1. CONFIG
// ============================================

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

// Form question titles (must match form exactly)
var FORM_FIELDS = {
  CUSTOMER_NAME: "Customer Name",
  IC_NUMBER: "IC Number",
  PHONE_NUMBER: "Phone Number",
  EMAIL: "Email",
  ADDRESS: "Address",
  MODEL: "Model",
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

// Real vehicle data from bydmiri-data/vehicles.json
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

// ============================================
// 2. SETUP (run once)
// ============================================

function setupRCOAutomation() {
  var ss = SpreadsheetApp.openById(CONFIG.RESPONSE_SHEET_ID);
  
  // --- Create output folder ---
  var folders = DriveApp.getFoldersByName(CONFIG.OUTPUT_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(CONFIG.OUTPUT_FOLDER_NAME);
  PropertiesService.getScriptProperties().setProperty("OUTPUT_FOLDER_ID", folder.getId());
  
  // --- Create DB sheets ---
  createSheetIfNotExists(ss, CONFIG.PRICE_DB, ["Model", "Variant", "Selling Price (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.SETTINGS_DB, ["Setting Name", "Value (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.ROADTAX_DB, ["Model", "Variant", "Road Tax (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.INSURANCE_DB, ["Min Price", "Max Price", "Insurance (MYR)"]);
  createSheetIfNotExists(ss, CONFIG.LOGS_SHEET, ["Timestamp", "Error", "Field", "Details"]);
  
  // --- Seed all DBs with real data ---
  seedPriceDB(ss);
  seedSettingsDB(ss);
  seedRoadTaxDB(ss);
  seedInsuranceDB(ss);
  
  // --- Update form with real model options ---
  updateFormModels();
  
  // --- Create trigger ---
  createFormTrigger();
  
  Logger.log("=== SETUP COMPLETE ===");
  Logger.log("Output Folder: " + folder.getUrl());
  Logger.log("DB sheets created in: " + ss.getUrl());
  Logger.log("Form updated with real models.");
  Logger.log("Trigger created for onFormSubmit.");
  Logger.log("");
  Logger.log("TEST: Fill the form at https://docs.google.com/forms/d/" + CONFIG.FORM_ID + "/viewform");
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
  // Clear old data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  var data = VEHICLE_DATA.map(function(v) {
    return [v.model, v.variant, v.rrp];
  });
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
  Logger.log("Seeded SETTINGS_DB with defaults");
}

function seedRoadTaxDB(ss) {
  var sheet = ss.getSheetByName(CONFIG.ROADTAX_DB);
  // Clear old data
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }
  var data = VEHICLE_DATA.map(function(v) {
    return [v.model, v.variant, v.roadTax];
  });
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
  Logger.log("Seeded INSURANCE_DB with tiers");
}

function updateFormModels() {
  var form = FormApp.openById(CONFIG.FORM_ID);
  var items = form.getItems();
  
  // Find the Model question and update choices
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === FORM_FIELDS.MODEL) {
      var models = [];
      var seen = {};
      VEHICLE_DATA.forEach(function(v) {
        if (!seen[v.model]) {
          models.push(v.model);
          seen[v.model] = true;
        }
      });
      if (items[i].getType() === FormApp.ItemType.LIST) {
        items[i].asListItem().setChoiceValues(models);
      }
      Logger.log("Updated Model dropdown with " + models.length + " models");
    }
    
    // Update Variant to dropdown too
    if (items[i].getTitle() === FORM_FIELDS.VARIANT) {
      var variants = [];
      VEHICLE_DATA.forEach(function(v) {
        variants.push(v.model + " - " + v.variant);
      });
      if (items[i].getType() === FormApp.ItemType.TEXT) {
        // Convert to list item
        var newItem = form.addListItem();
        newItem.setTitle(FORM_FIELDS.VARIANT).setHelpText("Select model variant");
        newItem.setChoiceValues(variants);
        form.deleteItem(items[i].getIndex());
        items = form.getItems(); // refresh
      }
      Logger.log("Updated Variant dropdown with " + variants.length + " options");
    }
    
    // Update Loan Period to match finance data (2-9 years = 24-108 months)
    if (items[i].getTitle() === FORM_FIELDS.LOAN_PERIOD) {
      if (items[i].getType() === FormApp.ItemType.LIST) {
        items[i].asListItem().setChoiceValues(["108", "96", "84", "72", "60", "48", "36", "24"]);
        Logger.log("Updated Loan Period dropdown");
      }
    }
  }
}

function createFormTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(CONFIG.FORM_ID)
    .onFormSubmit()
    .create();
  Logger.log("Trigger created: onFormSubmit");
}

// ============================================
// 3. MAIN - onFormSubmit handler
// ============================================

function onFormSubmit(e) {
  try {
    if (!e || !e.namedValues) {
      logError("No form data received", "ALL", "Event object is null");
      return;
    }
    
    var nv = e.namedValues;
    
    var formData = {
      customerName:    getFieldValue(nv, FORM_FIELDS.CUSTOMER_NAME),
      customerIC:      getFieldValue(nv, FORM_FIELDS.IC_NUMBER),
      customerPhone:   getFieldValue(nv, FORM_FIELDS.PHONE_NUMBER),
      customerEmail:   getFieldValue(nv, FORM_FIELDS.EMAIL),
      customerAddress: getFieldValue(nv, FORM_FIELDS.ADDRESS),
      model:           getFieldValue(nv, FORM_FIELDS.MODEL),
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
    
    // Clean variant (form sends "BYD Atto 3 - Ultra", strip model prefix)
    if (formData.variant && formData.variant.indexOf(" - ") > 0) {
      formData.variant = formData.variant.split(" - ")[1];
    }
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    
    // Step 2: Lookup DB values
    var dbValues = lookupDBValues(formData);
    
    // Step 3: Build replacement map
    var replacements = buildReplacements(formData, dbValues);
    
    // Step 4: Populate all placeholders via TextFinder
    populatePlaceholders(rcoSheet, replacements);
    
    // Step 5: Generate PDF
    var pdfFile = generatePDF(copySS, rcoSheet, formData.customerName);
    
    // Step 6: Clean up - delete the sheet copy (keep only PDF)
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    
    Logger.log("RCO generated for: " + formData.customerName);
    Logger.log("PDF saved: " + pdfFile.getUrl());
    
  } catch (err) {
    logError(err.toString(), "CATCH", err.stack);
  }
}

// ============================================
// 4. DATABASE - lookup functions
// ============================================

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
    logError("Setting not found", "SETTINGS", "Name: " + settingName);
    return "PENDING_REVIEW";
  } catch (e) {
    logError(e.toString(), "SETTINGS", "lookupSettingsDB failed");
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
    logError("Road tax not found", "ROADTAX", "Model: " + model + ", Variant: " + variant);
    return "PENDING_REVIEW";
  } catch (e) {
    logError(e.toString(), "ROADTAX", "lookupRoadTaxDB failed");
    return "PENDING_REVIEW";
  }
}

function lookupInsuranceDB(ss, model, variant) {
  try {
    var sheet = ss.getSheetByName(CONFIG.INSURANCE_DB);
    if (!sheet) return "PENDING_REVIEW";
    var sellingPrice = Number(lookupPriceDB(ss, model, variant));
    if (isNaN(sellingPrice)) {
      logError("Cannot determine insurance", "INSURANCE", "No valid price");
      return "PENDING_REVIEW";
    }
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var minVal = Number(data[i][0]);
      var maxVal = Number(data[i][1]);
      if (sellingPrice >= minVal && sellingPrice < maxVal) {
        return data[i][2];
      }
    }
    logError("Insurance tier not found", "INSURANCE", "Price: " + sellingPrice);
    return "PENDING_REVIEW";
  } catch (e) {
    logError(e.toString(), "INSURANCE", "lookupInsuranceDB failed");
    return "PENDING_REVIEW";
  }
}

// ============================================
// 5. RCO - copy template + populate + PDF
// ============================================

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

// ============================================
// 6. UTILS - helpers
// ============================================

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
