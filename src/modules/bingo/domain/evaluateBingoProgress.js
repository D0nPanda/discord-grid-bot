const { evaluateMainSquares } = require('./evaluateMainSquares');
const { evaluateSpendSquares } = require('./evaluateSpendSquares');
const { countCompletedLines } = require('./countLines');
const { determineRewards } = require('./determineRewards');

function evaluateBingoProgress(entries, card) {
  const {
    results: mainResults,
    mainAssignments,
  } = evaluateMainSquares(entries, card);

  const { results: allResults } = evaluateSpendSquares(
    entries,
    mainResults,
    card,
    mainAssignments
  );

  const totalSquares = card.cells.length;
  const completedSquares = Object.values(allResults).filter((cell) => cell.completed).length;

  const lineInfo = countCompletedLines(allResults, card.rows, card.cols);

  const rewardsUnlocked = determineRewards({
    completedLines: lineInfo.completedLines,
    completedSquares,
    totalSquares,
  });

  return {
    cells: allResults,
    summary: {
      totalSquares,
      completedSquares,
      completedLines: lineInfo.completedLines,
      completedRows: lineInfo.completedRowIndexes,
      completedCols: lineInfo.completedColIndexes,
      progressPercent: Math.round((completedSquares / totalSquares) * 100),
    },
    rewardsUnlocked,
  };
}

module.exports = { evaluateBingoProgress };