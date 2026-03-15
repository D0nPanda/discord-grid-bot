function parseMoney(value) {
  if (value === null || value === undefined || value === '') return 0;

  return Number(
    String(value)
      .replace(/\$/g, '')
      .replace(/,/g, '')
      .trim()
  ) || 0;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  return Number(value) || 0;
}

function normalizeOrderRow(row, rowIndex) {
  return {
    entryId: `${String(row.customerId).trim()}|${String(row.orderId).trim()}|${rowIndex}`,
    sourceIndex: rowIndex,
    customerId: String(row.customerId).trim(),
    orderId: String(row.orderId).trim(),
    category: String(row.category).trim(),
    quantity: parseNumber(row.quantity),
    total: parseMoney(row.total),
  };
}

module.exports = { normalizeOrderRow };