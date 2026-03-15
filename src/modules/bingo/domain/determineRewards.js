function determineRewards({ completedLines, completedSquares, totalSquares }) {
  const rewardsUnlocked = [];

  if (completedLines >= 1) {
    rewardsUnlocked.push({
      id: 'first_line',
      label: 'First Line Completed',
    });
  }

  if (completedLines >= 3) {
    rewardsUnlocked.push({
      id: 'three_lines',
      label: 'Three Lines Completed',
    });
  }

  if (completedSquares === totalSquares) {
    rewardsUnlocked.push({
      id: 'full_card',
      label: 'Full Card Completed',
    });
  }

  return rewardsUnlocked;
}

module.exports = { determineRewards };