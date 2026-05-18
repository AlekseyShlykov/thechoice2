/**
 * Google Apps Script — append game results to the "Results" sheet.
 *
 * Script properties: SUBMIT_SECRET (required), SPREADSHEET_ID (if standalone project)
 * Game submits via GET ?submit=1&secret=...&payload=<base64 JSON {rows:[...]}>
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

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.submit === '1') {
    return submitRows(params);
  }

  try {
    getResultsSheet();
    return jsonResponse({
      ok: true,
      service: 'thechoice-results',
      method: 'GET',
      submit: '?submit=1&secret=...&payload=<base64>',
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/** Optional: curl/tools that POST JSON directly. */
function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const expected = PropertiesService.getScriptProperties().getProperty('SUBMIT_SECRET');
    const provided = params.secret || '';
    if (!expected || provided !== expected) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const body = JSON.parse(e.postData.contents);
    return appendRows(body.rows);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function submitRows(params) {
  try {
    const expected = PropertiesService.getScriptProperties().getProperty('SUBMIT_SECRET');
    const provided = params.secret || '';
    if (!expected || provided !== expected) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }
    if (!params.payload) {
      return jsonResponse({ ok: false, error: 'payload required' });
    }

    const json = Utilities.newBlob(Utilities.base64Decode(params.payload)).getDataAsString('utf-8');
    const body = JSON.parse(json);
    return appendRows(body.rows);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function appendRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return jsonResponse({ ok: false, error: 'rows required' });
  }

  const sheet = getResultsSheet();
  rows.forEach(function (row) {
    sheet.appendRow(row);
  });

  return jsonResponse({ ok: true, appended: rows.length });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
