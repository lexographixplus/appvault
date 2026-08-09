export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * AppVault Google Apps Script Database Backend
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions -> Apps Script
 * 3. Replace all code with this snippet
 * 4. Click Deploy -> New deployment
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click Deploy, Authorize access, and copy the Web App URL into AppVault!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = {
    apps: getSheetData(ss, "Apps"),
    resources: getSheetData(ss, "Resources"),
    connections: getSheetData(ss, "Connections"),
    dependencies: getSheetData(ss, "Dependencies"),
    environments: getSheetData(ss, "Environments"),
    activity: getSheetData(ss, "Activity")
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawContents = e.postData.contents;
    var data = JSON.parse(rawContents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.apps) updateSheet(ss, "Apps", data.apps);
    if (data.resources) updateSheet(ss, "Resources", data.resources);
    if (data.connections) updateSheet(ss, "Connections", data.connections);
    if (data.dependencies) updateSheet(ss, "Dependencies", data.dependencies);
    if (data.environments) updateSheet(ss, "Environments", data.environments);
    if (data.activity) updateSheet(ss, "Activity", data.activity);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  var headers = rows[0];
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    var empty = true;
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val !== "") empty = false;
      // Parse JSON arrays or objects if stored
      if (typeof val === 'string' && (val.indexOf('[') === 0 || val.indexOf('{') === 0)) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      obj[headers[j]] = val;
    }
    if (!empty && obj.id) results.push(obj);
  }
  return results;
}

function updateSheet(ss, sheetName, items) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  if (!items || items.length === 0) {
    sheet.appendRow(["id"]);
    return;
  }

  // Collect headers from object keys
  var headersMap = {};
  items.forEach(function(item) {
    Object.keys(item).forEach(function(k) { headersMap[k] = true; });
  });
  var headers = Object.keys(headersMap);
  
  var rows = [headers];
  items.forEach(function(item) {
    var row = headers.map(function(k) {
      var val = item[k];
      if (val === undefined || val === null) return "";
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
    rows.push(row);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  // Style headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#4F46E5")
    .setFontColor("#FFFFFF");
}
`;
