/**
 * Google Apps Script — append game results to the "Results" sheet.
 *
 * Script properties (Project settings):
 *   SUBMIT_SECRET  — required, same as VITE_SHEETS_SECRET in GitHub
 *   SPREADSHEET_ID — required if script is NOT opened from the sheet (Extensions → Apps Script)
 *
 * Setup: see SETUP.md
 */

const SHEET_NAME = 'Results';

function getResultsSheet() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const ss = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('sheet not found: ' + SHEET_NAME);
  }
  return sheet;
}

/** Browser / health check (GET). Game submissions use POST (doPost). */
function doGet() {
  try {
    getResultsSheet();
    return jsonResponse({
      ok: true,
      service: 'thechoice-results',
      method: 'POST',
      body: { rows: [['<24 columns>']] },
      auth: 'query param secret must match SUBMIT_SECRET',
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const expected = PropertiesService.getScriptProperties().getProperty('SUBMIT_SECRET');
    const provided = (e.parameter && e.parameter.secret) || '';
    if (!expected || provided !== expected) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const body = JSON.parse(e.postData.contents);
    const rows = body.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return jsonResponse({ ok: false, error: 'rows required' });
    }

    const sheet = getResultsSheet();
    rows.forEach(function (row) {
      sheet.appendRow(row);
    });

    return jsonResponse({ ok: true, appended: rows.length });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
