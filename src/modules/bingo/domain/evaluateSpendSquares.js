function evaluateSpendSquares(entries, existingResults, card, mainAssignments) {
  const results = { ...existingResults };
  const usedSpendEntryIds = new Set();

  const spendCells = card.cells
    .filter((cell) => cell.type === 'spend_total')
    .sort((a, b) => a.priority - b.priority); // 75 primero, luego 55

  function assignSpendToEntry(entry) {
    for (const spendCell of spendCells) {
      if (results[spendCell.id] && results[spendCell.id].completed) continue;
      if (entry.total >= spendCell.minTotal) {
        results[spendCell.id] = {
          ...spendCell,
          completed: true,
          matchedEntryId: entry.entryId,
          matchedOrderId: entry.orderId,
        };
        usedSpendEntryIds.add(entry.entryId);
        return true;
      }
    }
    return false;
  }

  // Paso 1: spend paralelo para órdenes con principal, en orden natural de captura
  const mainAssignmentsInOrder = mainAssignments
    .slice()
    .sort((a, b) => a.sourceIndex - b.sourceIndex);

  for (const assignment of mainAssignmentsInOrder) {
    assignSpendToEntry(assignment);
  }

  // Paso 2: fallback para órdenes sin principal, también en orden natural
  const mainEntryIdSet = new Set(mainAssignments.map((a) => a.entryId));

  const fallbackEntries = entries
    .filter((entry) => !mainEntryIdSet.has(entry.entryId))
    .slice()
    .sort((a, b) => a.sourceIndex - b.sourceIndex);

  for (const entry of fallbackEntries) {
    const stillOpen = spendCells.filter(
      (cell) => !(results[cell.id] && results[cell.id].completed)
    );

    if (stillOpen.length === 0) break;
    if (usedSpendEntryIds.has(entry.entryId)) continue;

    assignSpendToEntry(entry);
  }

  for (const spendCell of spendCells) {
    if (!results[spendCell.id]) {
      results[spendCell.id] = {
        ...spendCell,
        completed: false,
        matchedEntryId: null,
        matchedOrderId: null,
      };
    }
  }

  return {
    results,
    usedSpendEntryIds,
  };
}

module.exports = { evaluateSpendSquares };