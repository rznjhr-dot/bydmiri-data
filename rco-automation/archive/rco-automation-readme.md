# BYD RCO Automation - Apps Script

## Overview
This project automates the creation of a Retail Customer Order (RCO) document for BYD vehicle sales. It uses Google Forms for data entry, Google Sheets for the RCO template and databases, and Google Apps Script for automation.

## Key Features
- **Google Form**: Mobile-friendly form for sales advisors to fill after meeting a customer.
- **Auto RCO Generation**: Script copies the master template, fills in data, and saves as PDF.
- **Database-driven**: Prices, fees, road tax, and insurance are looked up from separate sheets, not hardcoded.
- **TextFinder-based**: Uses `{{placeholder}}` tags in the template to locate and fill cells.

## Prerequisites
1. A Google account with access to Google Drive, Sheets, Forms, and Apps Script.
2. The master RCO template Google Sheet (shared as "Anyone with link → Viewer").
3. A Google Drive folder for saving generated RCO PDFs.

## Setup Instructions

### 1. Run the Form Creator Script
1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Delete the default code and paste the content of `create-rco-form.gs`.
3. Click **Run (▶)** to execute the script.
4. Note the following URLs from the execution logs (**View > Logs**):
   - **Form Edit URL**: To customize the form.
   - **Form Live URL**: The form you fill out.
   - **Response Spreadsheet URL**: Where form responses are stored.
5. Open the Response Spreadsheet. This will be the main spreadsheet for the project.

### 2. Add the Master RCO Template
1. In the Response Spreadsheet, create a new sheet called `MASTER_RCO`.
2. Copy your RCO template content into this sheet.
3. Ensure all `{{placeholder}}` tags are present in the template.

### 3. Add Database Sheets
Create the following sheets in the same spreadsheet:

#### PRICE_DB
| Model | Variant | Selling Price |
|---| BYD Atto 3 | Standard | 149800 |
| BYD Atto 3 | Premium | 169800 |

#### SETTINGS_DB
| Setting Name | Value |
|---|---|---|
| Inspection Fee | 200 |
| Plate Fee (EV) | 50 |
| Registration Fee | 300 |
| Delivery & Admin Fee | 500 |

#### ROADTAX_DB
| Engine/Motor Capacity | Road Tax |
|---|---|---|

#### INSURANCE_DB
| Vehicle Value Range | Insurance |
|---|---|---|
| <100k | 2300 |
| 100k-150k | 3000 |
| 150k-200k | 3500 |
| >200k | 4000 |

#### ACCESSORIES_DB
| Code | Description | Price |
|---|---|---|

### 4. Deploy the Automation Script
1. In the same Apps Script project, add new files for each script file:
   - `config.gs`: Paste content from `config.gs`.
   - `database.gs`: Paste content from `database.gs`.
   - `form.gs`: Paste content from `form.gs`.
   - `mapping.gs`: Paste content from `move fields to placeholders.
   - `rco.gs`: Paste content from `rco.gs`.
   - `utils.gs`: Paste content from `utils.gs`.
2. Update the IDs in `config.gs`:
   - `MASTER_TEMPLATE_ID`: The spreadsheet ID containing the master template.
   - `OUTPUT_FOLDER_ID`: The Drive folder ID where PDFs will be saved.
   - `FORM_ID`: The ID of the Google Form (from the URL).
   - `ID of the form response sheet`.
3. Save the project.

### 5. Set Up the Trigger
1. In the Apps Script editor, click the **Triggers** icon (alarm clock).
2. Click **Add Trigger** (bottom right).
3. Configure:
   - Choose function: `onFormSubmit`
   - Event type: **On form submit**
   - (Leave other settings default)
4. Save. You may be asked to authorize permissions. Click through.

## Usage
1. Fill the form with customer and vehicle details.
2. On submit, the script will:
   - Copy the master RCO template.
   - Fill all `{{placeholder}}` tags with data from the form and DB sheets.
   - Generate a PDF of the populated RCO.
   - Save the PDF to the output folder in Google Drive.
3. Check the output folder for the generated RCO PDF.

## Troubleshooting
- **Permissions**: First run will ask for Google account permissions. Click through.
- **TextFinder not replacing**: Ensure `{{placeholder}}` tags are exact (case-sensitive).
- **DB lookup failing**: Check that the model/variant in the form matches PRICE_DB exactly.
- **PDF not generating**: Ensure the output folder ID is correct in `config.gs`.

## File Structure
```
create-rco-form.gs     → One-time script to create the Google Form
config.gs             → All IDs and constants
database.gs           → DB lookup functions
form.gs               → Form trigger + data extraction
mapping.gs            → Maps form fields to placeholders
rco.gs                → Copy template + populate + generate PDF
utils.gs              → Helper functions (date, logging, etc.)
```
