/**
 * BYD RCO Form Creator
 * 
 * HOW TO USE:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Delete everything, paste this whole code
 * 4. Click Run (▶)
 * 5. Check the log (View > Logs) for your Form URL
 * 6. The form + linked spreadsheet are created automatically
 */

function createRCOForm() {
  // === CONFIG ===
  var FORM_TITLE = "BYD Sales Order (RCO) Form";
  var FORM_DESCRIPTION = "Fill this after meeting a customer. The system will auto-generate the RCO.";
  var SPREADSHEET_NAME = "RCO Responses (Auto)";
  
  // Create the form
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_DESCRIPTION);
  
  // --- CUSTOMER DETAILS ---
  form.addPageBreakItem().setTitle("Customer Details");
  
  form.addTextItem()
    .setTitle("Customer Name")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("IC Number")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("Phone Number")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("Email")
    .setRequired(false);
  
  form.addParagraphTextItem()
    .setTitle("Address")
    .setRequired(true);
  
  // --- VEHICLE DETAILS ---
  form.addPageBreakItem().setTitle("Vehicle Details");
  
  var modelItem = form.addListItem()
    .setTitle("Model")
    .setRequired(true);
  modelItem.setChoiceValues([
    "BYD Atto 3",
    "BYD Dolphin",
    "BYD Seal",
    "BYD M6",
    "BYD Sealion 7",
    "BYD e6",
    "Other"
  ]);
  
  form.addTextItem()
    .setTitle("Variant")
    .setHelpText("e.g., Standard, Premium, etc.")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("Colour")
    .setHelpText("Exterior colour")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("Chassis Number")
    .setRequired(false);
  
  form.addTextItem()
    .setTitle("Engine Number")
    .setHelpText("For EVs, this is the motor number")
    .setRequired(false);
  
  form.addTextItem()
    .setTitle("Registration Number")
    .setHelpText("e.g., QAB 1234")
    .setRequired(false);
  
  form.addTextItem()
    .setTitle("Year Make")
    .setRequired(false);
  
  // --- FINANCE ---
  form.addPageBreakItem().setTitle("Finance Details");
  
  form.addTextItem()
    .setTitle("Loan Amount (MYR)")
    .setHelpText("Total finance amount")
    .setRequired(false);
  
  var tenureItem = form.addListItem()
    .setTitle("Loan Period (Months)")
    .setRequired(false);
  tenureItem.setChoiceValues([
    "108",
    "96",
    "84",
    "72",
    "60",
    "48",
    "36",
    "24"
  ]);
  
  form.addTextItem()
    .setTitle("Downpayment (MYR)")
    .setRequired(false);
  
  form.addTextItem()
    .setTitle("Trade-In Details")
    .setHelpText("e.g., 2020 Perdana, ABC1234, RM50,000")
    .setRequired(false);
  
  // --- SALES INFO ---
  form.addPageBreakItem().setTitle("Sales Info");
  
  form.addTextItem()
    .setTitle("Sales Advisor")
    .setRequired(true);
  
  form.addParagraphTextItem()
    .setTitle("Remarks")
    .setRequired(false);
  
  // === LINK FORM TO SPREADSHEET ===
  var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // === OUTPUT ===
  Logger.log("=== FORM CREATED ===");
  Logger.log("Form URL: " + form.getEditUrl());
  Logger.log("Form Live URL (for filling): " + form.getPublishedUrl());
  Logger.log("Response Spreadsheet URL: " + ss.getUrl());
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("");
  Logger.log("NEXT STEPS:");
  Logger.log("1. Open the Response Spreadsheet URL above");
  Logger.log("2. Add your RCO template + DB sheets to this spreadsheet");
  Logger.log("3. Add the RCO automation script (rco.gs etc)");
  Logger.log("4. Set up the form submit trigger");
}
