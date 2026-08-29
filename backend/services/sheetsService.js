/**
 * FlowPilot AI Google Sheets Automation Service
 * Handles appending structured business data/leads to Google Sheets or Mock Sheet.
 */

const { google } = require('googleapis');
const { MockGoogleSheet } = require('./storeAdapter');

/**
 * Format structured row from AI analysis
 */
function buildSheetRow(aiAnalysis, rawInput = {}) {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return {
    timestamp: dateStr,
    name: aiAnalysis.customer_name || 'Unknown',
    email: aiAnalysis.email || 'N/A',
    company: aiAnalysis.company || 'N/A',
    request: rawInput.message || aiAnalysis.summary,
    intent: aiAnalysis.intent || 'lead',
    priority: aiAnalysis.priority || 'medium',
    summary: aiAnalysis.summary || '',
    recommended_action: (aiAnalysis.requested_action || 'notify_sales').replace(/_/g, ' '),
    status: 'New'
  };
}

/**
 * Append row to Google Sheets
 */
async function appendToGoogleSheet({ aiAnalysis, rawInput, route }) {
  const sheetName = route.actionParams?.sheetName || 'Inbound Leads 2026';
  const rowData = buildSheetRow(aiAnalysis, rawInput);

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const isDemoMode = process.env.DEMO_MODE !== 'false' || !sheetId || !serviceAccountEmail;

  // Demo Mode or Missing Credentials
  if (isDemoMode) {
    const demoRow = {
      id: `sheet-row-${Date.now()}`,
      ...rowData
    };

    await MockGoogleSheet.create(demoRow);

    return {
      status: 'SUCCESS',
      mode: 'DEMO',
      action: 'google_sheets_insert',
      sheetName,
      rowInserted: rowData,
      details: `[DEMO MODE] Row appended to FlowPilot Mock Google Sheet [${sheetName}]. Live credentials not configured in .env.`
    };
  }

  // Live Mode: Google Sheets API
  try {
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        rowData.timestamp,
        rowData.name,
        rowData.email,
        rowData.company,
        rowData.request,
        rowData.intent,
        rowData.priority,
        rowData.summary,
        rowData.recommended_action,
        rowData.status
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    return {
      status: 'SUCCESS',
      mode: 'LIVE',
      action: 'google_sheets_insert',
      sheetName,
      rowInserted: rowData,
      updatedRange: response.data.updates?.updatedRange,
      details: `[LIVE EXECUTION] Successfully appended row to Google Sheet [${sheetId}] tab [${sheetName}].`
    };
  } catch (error) {
    console.error('❌ [Google Sheets Service] Error writing to sheet:', error.message);
    return {
      status: 'FAILED',
      mode: 'LIVE',
      action: 'google_sheets_insert',
      sheetName,
      rowInserted: rowData,
      error: error.message,
      details: `Google Sheets API append failed: ${error.message}`
    };
  }
}

module.exports = {
  appendToGoogleSheet,
  buildSheetRow
};
