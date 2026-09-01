# Project: Google Workspace Sales Order Automation (BYD)

## Objective

Build a simple, maintainable Google Workspace automation for my daily sales workflow.

This is NOT a customer-facing system.

I (the sales advisor) will manually fill in a Google Form after meeting a customer.

After I submit the form, the system should automatically prepare a Sales Order (RCO) based on my existing Google Sheets template.

The goal is to eliminate repetitive manual typing while keeping the workflow simple and fully inside Google Workspace.

---

# Technology Stack

Use ONLY Google Workspace.

- Google Forms
- Google Sheets
- Google Apps Script
- Google Drive

Do NOT use:

- Firebase
- Supabase
- Next.js
- React
- Node.js
- n8n
- Zapier
- Make.com
- External servers

Everything should remain inside Google Workspace.

---

# Template Convention

The RCO template uses `{{PLACEHOLDER}}` tags inside cells (e.g., `{{CUSTOMER NAME}}`, `{{BODYPRICE}}`).

These tags mark exactly where data should be written.

Apps Script must use `sheet.createTextFinder("{{TAG}}").replaceAllWith(value)` to locate and populate fields.

Do NOT hardcode cell references (e.g., `getRange("B12")`).

This ensures the script survives template layout changes.

---

# Existing RCO Template

The Google Sheet is shared as "Anyone with link → Viewer."

If you cannot access it, STOP and ask me to fix sharing permissions.

Do NOT guess the template structure or proceed without reading it.

MASTER_RCO_TEMPLATE LINK: https://docs.google.com/spreadsheets/d/1nHrgl60mq1G3MB0KccEHjHnntzY6u9Kd/edit?gid=54712902#gid=54712902

This sheet is the MASTER template.

Never overwrite the original template.

Always make a copy before writing data.

Workflow:

```
MASTER_RCO_TEMPLATE
        ↓
    Copy
        ↓
Populate fields
        ↓
  Draft RCO
        ↓
 Generate PDF
        ↓
Save into Google Drive
```

---

# Template Placeholders Already in the Sheet

The template already contains these `{{placeholder}}` tags:

| Placeholder | Source | Description |
|---|---|---|
| `{{CUSTOMER NAME}}` | Google Form | Customer name |
| `{{CUSTOMER ADDRESS}}` | Google Form | Customer address |
| `{{CUSTOMER IC}}` | Google Form | IC/Passport/Business Reg No. |
| `{{CUSTOMER PHONE}}` | Google Form | Phone number |
| `{{CUSTOMER EMAIL}}` | Google Form | Email |
| `{{MODEL}}` | Google Form | Vehicle make/model |
| `{{COLOR}}` | Google Form | Exterior & interior colour |
| `{{CHASSIS}}` | Google Form | Chassis number |
| `{{ENGINE}}` | Google Form | Engine number |
| `{{YM}}` | Google Form | Year make |
| `{{DATE}}` | Auto | Today's date (DD/MM/YY) |
| `{{BODYPRICE}}` | PRICE_DB | Selling price (lookup by Model + Variant) |
| `{{B2}}` | SETTINGS_DB | Inspection/Weighing Fee |
| `{{EVPLATE}}` | SETTINGS_DB | Number Plate Frame |
| `{{REGFEE}}` | SETTINGS_DB | Registration/Transfer Fee |
| `{{ROADTAX}}` | ROADTAX_DB | Road tax |
| `{{INSURANCE}}` | INSURANCE_DB | Insurance amount |
| `{{LOANAMOUNT}}` | Google Form | Finance loan amount (MYR) |
| `{{TENURE}}` | Google Form | Finance period (months) |

Fields in the RCO that have NO placeholder (Trade-In, Accessories, Deposit, Hire Purchase Co., Insurance Co. details, NCD, etc.) should be left as-is — the sales advisor will fill those manually after the script runs.

Do NOT create new placeholders.

Do NOT modify cells that have no placeholder.

---

# Desired Workflow

### Step 1

Create a Google Form programmatically via Apps Script (`FormApp.create()`).

Form fields:

- Customer Name (text)
- IC Number (text)
- Phone Number (text)
- Email (text)
- Address (paragraph)
- Model (text)
- Variant (text)
- Colour (text)
- Chassis Number (text)
- Engine Number (text)
- Registration Number (text)
- Loan Amount (text)
- Loan Period in months (text)
- Downpayment (text)
- Trade-In (paragraph)
- Sales Advisor (text)
- Remarks (paragraph)

After creation, output the Form URL and linked Sheet URL.

### Step 2

Google Form submits into Google Sheets (auto-linked).

### Step 3

Apps Script triggers automatically on form submit.

### Step 4

Apps Script creates a copy of MASTER_RCO_TEMPLATE in the output folder.

### Step 5

Populate all `{{placeholder}}` tags using `createTextFinder().replaceAllWith()`.

### Step 6

Lookup pricing from database sheets (PRICE_DB, SETTINGS_DB, ROADTAX_DB, INSURANCE_DB).

### Step 7

Generate draft RCO (the populated copy).

### Step 8

Generate PDF via `SpreadsheetApp` export.

### Step 9

Save PDF into Google Drive output folder.

Optional:

Email PDF to myself.

---

# Databases

Create separate sheets for maintainability.

### PRICE_DB

| Model | Variant | Selling Price |

### SETTINGS_DB

| Setting Name | Value |

Examples: Inspection Fee, Registration Fee, Plate Fee (EV), Delivery & Admin Fee.

### ROADTAX_DB

| Engine/Motor Capacity | Road Tax |

### INSURANCE_DB

| Vehicle Value Range | Insurance |

Example tiers:

| Range | Insurance |
|---|---|
| <100k | 2,300 |
| 100k-150k | 3,000 |
| 150k-200k | 3,500 |
| >200k | 4,000 |

### ACCESSORIES_DB

| Code | Description | Price |

The script should always read from these sheets.

Do NOT hardcode prices.

If I update PRICE_DB, future RCOs must automatically use the latest prices.

---

# Error Handling

If a required field is missing or a DB lookup fails:

- Write "PENDING_REVIEW" in the affected `{{placeholder}}` cell
- Log the error to a LOGS sheet (columns: Timestamp, Error, Field, Form Response Row)
- Do NOT crash the script or leave placeholders unfilled
- Continue processing remaining fields

---

# Apps Script Requirements

Create clean, modular code.

Suggested files:

```
config.gs     → all IDs and constants
database.gs   → DB lookup functions
form.gs       → form creation + trigger setup
mapping.gs    → maps form fields to placeholders
rco.gs        → copy template + populate + generate PDF
utils.gs     → helper functions (date formatting, logging, etc.)
```

Avoid putting everything into one giant file.

Use constants in config.gs:

```javascript
const CONFIG = {
  MASTER_TEMPLATE_ID: "...",
  OUTPUT_FOLDER_ID: "...",
  FORM_ID: "...",
  RESPONSE_SHEET_ID: "...",
  PRICE_DB: "PRICE_DB",
  SETTINGS_DB: "SETTINGS_DB",
  ROADTAX_DB: "ROADTAX_DB",
  INSURANCE_DB: "INSURANCE_DB",
  ACCESSORIES_DB: "ACCESSORIES_DB",
  LOGS_SHEET: "LOGS"
};
```

Keep everything configurable.

Do NOT apply sheet protection or data validation to any sheet.

Do NOT modify formatting, borders, colours, or formulas in the RCO template.

Only populate the mapped placeholder cells via TextFinder.

---

# Maintainability

- Do NOT hardcode spreadsheet IDs throughout the project.
- Keep all IDs inside config.gs.
- Create reusable helper functions.
- Add comments only where useful.
- Use descriptive variable names.
- Follow clean architecture.

---

# Future Expansion

Structure the project so future features can be added easily.

Examples:

- Customer Folder (auto-create Drive folder per customer)
- Loan Status tracking
- Booking Status tracking
- Dashboard summary sheet
- Email Notifications
- WhatsApp Notifications

These do NOT need to be implemented now.

Just keep the code extensible.

---

# Phase 1 (Analysis Only) — DO THIS BEFORE CODING

Before writing any code:

1. Open and analyse the provided RCO template.
2. Confirm every `{{placeholder}}` tag listed above exists in the sheet.
3. Produce a complete FIELD_MAPPING table in this format:

| Placeholder | Source | Form Field / DB Lookup | Notes |
|---|---|---|---|
| {{CUSTOMER NAME}} | Google Form | Customer Name | — |
| {{BODYPRICE}} | PRICE_DB | Lookup by Model + Variant | — |
| ... | ... | ... | ... |

4. Identify all calculated fields and specify formulas.
5. Identify which values should come from:
   - Google Form
   - PRICE_DB
   - SETTINGS_DB
   - ROADTAX_DB
   - INSURANCE_DB
6. Flag any ambiguities or missing information.
7. List all DB sheets that need to be created, with column headers.
8. Wait for my approval before generating code.

**Do NOT start coding until the mapping has been reviewed and approved.**

---

# Deliverables

1. Google Form structure (created via Apps Script)
2. Database sheet structures (PRICE_DB, SETTINGS_DB, ROADTAX_DB, INSURANCE_DB, ACCESSORIES_DB)
3. RCO mapping table (from Phase 1)
4. Complete Apps Script project (all .gs files)
5. Trigger setup instructions
6. Folder structure in Google Drive
7. Deployment instructions
8. Documentation explaining how everything works

---

# Important

Do not over-engineer.

This is a tool for one sales advisor.

Priorities:

1. Simplicity
2. Reliability
3. Easy maintenance
4. Easy to update prices
5. Minimal manual work

The system should feel like a lightweight internal tool rather than an enterprise application.
