/**
 * BYD RCO AUTOMATION - v5.0
 * 
 * Fixes:
 *   1. Write model DIRECTLY to N13 (merged N13:AB13) + TextFinder backup
 *   2. Write all prices DIRECTLY to their cells + TextFinder backup
 *   3. No DB lookups - VEHICLE_DATA directly
 *   4. Landscape A4 single page PDF
 *   5. Extensive debug logging
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

// Direct vehicle data
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

// Cell references for direct writing (from template analysis + user input)
var CELL_MAP = {
  CUSTOMER_NAME: "A3",      // merged cell
  CUSTOMER_IC: "G5",
  CUSTOMER_PHONE: "A8",
  CUSTOMER_EMAIL: "A10",
  MODEL: "N13",             // user said N13:AB13 (merged)
  COLOR: "N4",
  CHASSIS: "N6",
  ENGINE: "N10",
  YM: "X6",
  DATE: "AC3",
  BODYPRICE: "P12",
  B2: "P23",
  EVPLATE: "P24",
  REGFEE: "P31",
  ROADTAX: "P32",
  INSURANCE: "P36",
  LOANAMOUNT: "Z32",
  TENURE: "AL32"
};

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
      Logger.log("ERROR: e.namedValues is null");
      logError("No form data", "ALL", "e.namedValues null");
      return;
    }
    
    var nv = e.namedValues;
    
    // Debug: log ALL keys
    var keys = Object.keys(nv);
    Logger.log("Form keys (" + keys.length + "): " + keys.join(", "));
    for (var k = 0; k < keys.length; k++) {
      Logger.log("  " + keys[k] + " = " + JSON.stringify(nv[keys[k]]));
    }
    
    // Extract model + variant from dropdown
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
    
    // Look up vehicle data
    var vehicle = null;
    for (var i = 0; i < VEHICLE_DATA.length; i++) {
      if (VEHICLE_DATA[i].model.toLowerCase() === model.toLowerCase() &&
          VEHICLE_DATA[i].variant.toLowerCase() === variant.toLowerCase()) {
        vehicle = VEHICLE_DATA[i];
        break;
      }
    }
    
    if (vehicle) {
      Logger.log("Vehicle found: rrp=" + vehicle.rrp + " roadTax=" + vehicle.roadTax + " b2=" + vehicle.b2Fee + " evPlate=" + vehicle.evPlate + " regFee=" + vehicle.regFee);
    } else {
      Logger.log("WARNING: No vehicle match for " + model + " " + variant);
      logError("Vehicle not found", "VEHICLE", model + " " + variant);
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
    
    Logger.log("Form data: " + JSON.stringify(formData));
    
    // Step 1: Copy master template
    var copyFile = copyMasterTemplate();
    var copySS = SpreadsheetApp.openById(copyFile.getId());
    var rcoSheet = getRCOSheet(copySS);
    Logger.log("Template copied. Sheet: " + rcoSheet.getName() + " ID: " + rcoSheet.getSheetId());
    
    // Step 2: Write values DIRECTLY to cells (more reliable than TextFinder)
    Logger.log("--- Writing directly to cells ---");
    
    // Model → N13 (user specified N13:AB13 merged range)
    if (formData.model) {
      rcoSheet.getRange(CELL_MAP.MODEL).setValue(formData.model);
      Logger.log("Wrote model to " + CELL_MAP.MODEL + ": " + formData.model);
    }
    
    // Customer name → A3 (merged, contains both name + address)
    // Need to handle merged cell - write name + address together
    if (formData.customerName) {
      var nameAddr = formData.customerName;
      if (formData.customerAddress) nameAddr += "\n" + formData.customerAddress;
      rcoSheet.getRange(CELL_MAP.CUSTOMER_NAME).setValue(nameAddr);
      Logger.log("Wrote customer name+address to " + CELL_MAP.CUSTOMER_NAME);
    }
    
    // Customer IC → G5
    if (formData.customerIC) {
      rcoSheet.getRange(CELL_MAP.CUSTOMER_IC).setValue(formData.customerIC);
      Logger.log("Wrote IC to " + CELL_MAP.CUSTOMER_IC + ": " + formData.customerIC);
    }
    
    // Phone → A8
    if (formData.customerPhone) {
      rcoSheet.getRange(CELL_MAP.CUSTOMER_PHONE).setValue(formData.customerPhone);
      Logger.log("Wrote phone to " + CELL_MAP.CUSTOMER_PHONE);
    }
    
    // Email → A10
    if (formData.customerEmail) {
      rcoSheet.getRange(CELL_MAP.CUSTOMER_EMAIL).setValue(formData.customerEmail);
      Logger.log("Wrote email to " + CELL_MAP.CUSTOMER_EMAIL);
    }
    
    // Colour → N4
    if (formData.colour) {
      rcoSheet.getRange(CELL_MAP.COLOR).setValue(formData.colour);
      Logger.log("Wrote colour to " + CELL_MAP.COLOR);
    }
    
    // Chassis → N6
    if (formData.chassis) {
      rcoSheet.getRange(CELL_MAP.CHASSIS).setValue(formData.chassis);
      Logger.log("Wrote chassis to " + CELL_MAP.CHASSIS);
    }
    
    // Engine → N10
    if (formData.engine) {
      rcoSheet.getRange(CELL_MAP.ENGINE).setValue(formData.engine);
      Logger.log("Wrote engine to " + CELL_MAP.ENGINE);
    }
    
    // Year Make → X6
    if (formData.yearMake) {
      rcoSheet.getRange(CELL_MAP.YM).setValue(formData.yearMake);
      Logger.log("Wrote year make to " + CELL_MAP.YM);
    }
    
    // Date → AC3
    rcoSheet.getRange(CELL_MAP.DATE).setValue(formatDate(new Date()));
    Logger.log("Wrote date to " + CELL_MAP.DATE);
    
    // Body Price (RRP) → P12
    if (vehicle) {
      rcoSheet.getRange(CELL_MAP.BODYPRICE).setValue(vehicle.rrp);
      Logger.log("Wrote body price to " + CELL_MAP.BODYPRICE + ": " + vehicle.rrp);
      
      // B2 Inspection Fee → P23
      rcoSheet.getRange(CELL_MAP.B2).setValue(vehicle.b2Fee);
      Logger.log("Wrote B2 fee to " + CELL_MAP.B2 + ": " + vehicle.b2Fee);
      
      // EV Plate → P24
      rcoSheet.getRange(CELL_MAP.EVPLATE).setValue(vehicle.evPlate);
      Logger.log("Wrote EV plate to " + CELL_MAP.EVPLATE + ": " + vehicle.evPlate);
      
      // Reg Fee → P31
      rcoSheet.getRange(CELL_MAP.REGFEE).setValue(vehicle.regFee);
      Logger.log("Wrote reg fee to " + CELL_MAP.REGFEE + ": " + vehicle.regFee);
      
      // Road Tax → P32
      rcoSheet.getRange(CELL_MAP.ROADTAX).setValue(vehicle.roadTax);
      Logger.log("Wrote road tax to " + CELL_MAP.ROADTAX + ": " + vehicle.roadTax);
      
      // Insurance → P36
      var insurance = calcInsurance(vehicle.rrp);
      rcoSheet.getRange(CELL_MAP.INSURANCE).setValue(insurance);
      Logger.log("Wrote insurance to " + CELL_MAP.INSURANCE + ": " + insurance);
    }
    
    // Loan Amount → Z32
    if (formData.loanAmount) {
      rcoSheet.getRange(CELL_MAP.LOANAMOUNT).setValue(formData.loanAmount);
      Logger.log("Wrote loan amount to " + CELL_MAP.LOANAMOUNT + ": " + formData.loanAmount);
    }
    
    // Tenure → AL32
    if (formData.loanPeriod) {
      rcoSheet.getRange(CELL_MAP.TENURE).setValue(formData.loanPeriod);
      Logger.log("Wrote tenure to " + CELL_MAP.TENURE + ": " + formData.loanPeriod);
    }
    
    // Step 3: ALSO run TextFinder as backup (in case cell refs are off)
    Logger.log("--- Running TextFinder backup ---");
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
    
    for (var placeholder in replacements) {
      try {
        var found = rcoSheet.createTextFinder(placeholder).replaceAllWith(String(replacements[placeholder]));
        Logger.log("TextFinder: " + placeholder + " → " + replacements[placeholder] + " (matched: " + found + ")");
      } catch (tfErr) {
        Logger.log("TextFinder failed for " + placeholder + ": " + tfErr.toString());
      }
    }
    
    // Step 4: Generate PDF
    var pdfFile = generatePDF(copySS, rcoSheet, formData.customerName);
    Logger.log("PDF created: " + pdfFile.getUrl());
    
    // Step 5: Clean up draft
    DriveApp.getFileById(copyFile.getId()).setTrashed(true);
    Logger.log("=== RCO COMPLETE: " + formData.customerName + " ===");
    
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
  var lastRow = sheet.getDataRange().getLastRow();
  var lastCol = sheet.getDataRange().getLastColumn();
  var colLetter = columnToLetter(lastCol);
  var range = "A1:" + colLetter + lastRow;
  
  Logger.log("PDF range: " + range + " (rows=" + lastRow + " cols=" + lastCol + ")");
  
  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf" +
    "&gid=" + sheetId +
    "&size=A4" +
    "&orientation=landscape" +
    "&fitw=true" +
    "&gridlines=false" +
    "&printnotes=false" +
    "&sheetnotes=false" +
    "&printtitle=false" +
    "&fzr=false" +
    "&fzc=false" +
    "&horizontal_alignment=left" +
    "&vertical_alignment=middle" +
    "&top_margin=0.25" +
    "&bottom_margin=0.25" +
    "&left_margin=0.25" +
    "&right_margin=0.25" +
    "&range=" + encodeURIComponent(range);
  
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
  Logger.log("PDF: " + pdfFile.getName() + " (" + pdfFile.getSize() + " bytes)");
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
