const { getGoogleSheetsClient } = require('./googleSheetsClient');
const { normalizeOrderRow } = require('../domain/normalizeOrders');

async function getOrdersByCustomerId(customerId) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_ORDERS_SHEET_NAME || 'Orders';

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID in environment variables.');
  }

  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:E`,
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;

  const normalizedHeaders = headerRow.map((header) =>
    String(header || '').trim().toLowerCase()
  );

  const customerIdIndex = normalizedHeaders.findIndex((h) => h === 'customer id');
  const orderIdIndex = normalizedHeaders.findIndex((h) => h === 'order id');
  const categoryIndex = normalizedHeaders.findIndex((h) => h === 'category');
  const quantityIndex = normalizedHeaders.findIndex((h) => h === 'quantity');
  const totalIndex = normalizedHeaders.findIndex((h) => h === 'total $');

  if (
    customerIdIndex === -1 ||
    orderIdIndex === -1 ||
    categoryIndex === -1 ||
    quantityIndex === -1 ||
    totalIndex === -1
  ) {
    throw new Error(
      'Orders sheet headers are invalid. Expected: Customer ID, Order ID, Category, Quantity, Total $.'
    );
  }

  const filteredRows = dataRows.filter((row) => {
    const rowCustomerId = String(row[customerIdIndex] || '').trim();
    return rowCustomerId === String(customerId).trim();
  });

  return filteredRows.map((row, index) =>
    normalizeOrderRow(
      {
        customerId: row[customerIdIndex],
        orderId: row[orderIdIndex],
        category: row[categoryIndex],
        quantity: row[quantityIndex],
        total: row[totalIndex],
      },
      index
    )
  );
}

module.exports = { getOrdersByCustomerId };