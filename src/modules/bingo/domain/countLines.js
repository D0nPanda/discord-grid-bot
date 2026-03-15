function countCompletedLines(cellResults, rows = 5, cols = 5) {
  const byPosition = new Map();

  Object.values(cellResults).forEach((cell) => {
    byPosition.set(`${cell.row}:${cell.col}`, Boolean(cell.completed));
  });

  let completedLines = 0;
  const completedRowIndexes = [];
  const completedColIndexes = [];

  for (let row = 1; row <= rows; row += 1) {
    let rowComplete = true;

    for (let col = 1; col <= cols; col += 1) {
      if (!byPosition.get(`${row}:${col}`)) {
        rowComplete = false;
        break;
      }
    }

    if (rowComplete) {
      completedLines += 1;
      completedRowIndexes.push(row);
    }
  }

  for (let col = 1; col <= cols; col += 1) {
    let colComplete = true;

    for (let row = 1; row <= rows; row += 1) {
      if (!byPosition.get(`${row}:${col}`)) {
        colComplete = false;
        break;
      }
    }

    if (colComplete) {
      completedLines += 1;
      completedColIndexes.push(col);
    }
  }

  return {
    completedLines,
    completedRowIndexes,
    completedColIndexes,
  };
}

module.exports = { countCompletedLines };