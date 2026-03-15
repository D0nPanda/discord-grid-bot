function getEntryValueForCell(entry, cell) {
  if (cell.type === 'category_quantity') return entry.quantity;
  if (cell.type === 'category_total') return entry.total;
  return 0;
}

function entryMatchesCell(entry, cell) {
  if (entry.category !== cell.category) return false;

  if (cell.type === 'category_quantity') {
    return entry.quantity >= cell.minQuantity;
  }

  if (cell.type === 'category_total') {
    return entry.total >= cell.minTotal;
  }

  return false;
}

function evaluateMainSquares(entries, card) {
  const results = {};
  const usedMainEntryIds = new Set();
  const mainAssignments = [];

  for (const cell of card.cells) {
    if (cell.type === 'free_space') {
      results[cell.id] = {
        ...cell,
        completed: true,
        matchedEntryId: null,
        matchedOrderId: null,
      };
    }
  }

  const groupedCells = new Map();

  for (const cell of card.cells) {
    if (cell.type !== 'category_quantity' && cell.type !== 'category_total') continue;

    const key = `${cell.type}:${cell.category}`;
    if (!groupedCells.has(key)) groupedCells.set(key, []);
    groupedCells.get(key).push(cell);
  }

  for (const [, cells] of groupedCells.entries()) {
    const sampleCell = cells[0];

    const eligibleEntries = entries
      .filter((entry) => entry.category === sampleCell.category)
      .slice()
      .sort((a, b) => {
        const valueDiff = getEntryValueForCell(b, sampleCell) - getEntryValueForCell(a, sampleCell);
        if (valueDiff !== 0) return valueDiff;
        return a.sourceIndex - b.sourceIndex;
      });

    const orderedCells = cells.slice().sort((a, b) => a.priority - b.priority);

    for (const cell of orderedCells) {
      const matchedEntry = eligibleEntries.find((entry) => {
        if (usedMainEntryIds.has(entry.entryId)) return false;
        return entryMatchesCell(entry, cell);
      });

      if (matchedEntry) {
        usedMainEntryIds.add(matchedEntry.entryId);

        results[cell.id] = {
          ...cell,
          completed: true,
          matchedEntryId: matchedEntry.entryId,
          matchedOrderId: matchedEntry.orderId,
        };

        mainAssignments.push({
          entryId: matchedEntry.entryId,
          orderId: matchedEntry.orderId,
          total: matchedEntry.total,
          sourceIndex: matchedEntry.sourceIndex,
          cellId: cell.id,
        });
      } else {
        results[cell.id] = {
          ...cell,
          completed: false,
          matchedEntryId: null,
          matchedOrderId: null,
        };
      }
    }
  }

  return {
    results,
    usedMainEntryIds,
    mainAssignments,
  };
}

module.exports = { evaluateMainSquares };