/**
 * Google Apps Script — append game results to the "Results" sheet.
 *
 * Setup: see SETUP.md in this folder.
 */

const SHEET_NAME = 'Results';

/** Browser / health check (GET). Game submissions use POST (doPost). */
function doGet() {
  return jsonResponse({
    ok: true,
    service: 'thechoice-results',
    method: 'POST',
    body: { rows: [['<24 columns>']] },
    auth: 'query param secret must match SUBMIT_SECRET script property',
  });
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

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'sheet not found: ' + SHEET_NAME });
    }

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
