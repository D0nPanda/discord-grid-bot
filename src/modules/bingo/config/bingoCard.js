const GRID_LAYOUT = {
  startX: 4,
  startY: 271,
  cellWidth: 102,
  cellHeight: 76,
  gapX: 1,
  gapY: 1,
};

function withRect(cell) {
  return {
    ...cell,
    rect: {
      x: GRID_LAYOUT.startX + (cell.col - 1) * (GRID_LAYOUT.cellWidth + GRID_LAYOUT.gapX),
      y: GRID_LAYOUT.startY + (cell.row - 1) * (GRID_LAYOUT.cellHeight + GRID_LAYOUT.gapY),
      width: GRID_LAYOUT.cellWidth,
      height: GRID_LAYOUT.cellHeight,
    },
  };
}
const rawCells = [
  // aquí dejas exactamente todas tus 25 celdas como ya las tienes
  { id: 'r1c1', row: 1, col: 1, label: 'Skilling', type: 'category_total', category: 'Powerleveling', minTotal: 45, priority: 2 },
    { id: 'r1c2', row: 1, col: 2, label: '90kc PvM Mid', type: 'category_quantity', category: 'PvM Mid', minQuantity: 90, priority: 2 },
    { id: 'r1c3', row: 1, col: 3, label: '3 Quests', type: 'category_quantity', category: 'Questing', minQuantity: 3, priority: 3 },
    { id: 'r1c4', row: 1, col: 4, label: '2 Minigames', type: 'category_quantity', category: 'Minigame', minQuantity: 2, priority: 3 },
    { id: 'r1c5', row: 1, col: 5, label: '200kc PvM Low', type: 'category_quantity', category: 'PvM Low', minQuantity: 200, priority: 2 },

    { id: 'r2c1', row: 2, col: 1, label: '30kc PvM High', type: 'category_quantity', category: 'PvM High', minQuantity: 30, priority: 2 },
    { id: 'r2c2', row: 2, col: 2, label: '3 Diaries', type: 'category_quantity', category: 'Diary', minQuantity: 3, priority: 3 },
    { id: 'r2c3', row: 2, col: 3, label: '60kc PvM Low', type: 'category_quantity', category: 'PvM Low', minQuantity: 60, priority: 3 },
    { id: 'r2c4', row: 2, col: 4, label: '4 Quests', type: 'category_quantity', category: 'Questing', minQuantity: 4, priority: 2 },
    { id: 'r2c5', row: 2, col: 5, label: 'Spend $55', type: 'spend_total', minTotal: 55, priority: 2 },

    { id: 'r3c1', row: 3, col: 1, label: '3 Minigames', type: 'category_quantity', category: 'Minigame', minQuantity: 3, priority: 2 },
    { id: 'r3c2', row: 3, col: 2, label: '40kc PvM Low', type: 'category_quantity', category: 'PvM Low', minQuantity: 40, priority: 4 },
    { id: 'r3c3', row: 3, col: 3, label: 'FREE SPACE', type: 'free_space', priority: 1 },
    { id: 'r3c4', row: 3, col: 4, label: '2 Diaries', type: 'category_quantity', category: 'Diary', minQuantity: 2, priority: 4 },
    { id: 'r3c5', row: 3, col: 5, label: '120kc PvM Mid', type: 'category_quantity', category: 'PvM Mid', minQuantity: 120, priority: 1 },

    { id: 'r4c1', row: 4, col: 1, label: '5 Quests', type: 'category_quantity', category: 'Questing', minQuantity: 5, priority: 1 },
    { id: 'r4c2', row: 4, col: 2, label: 'Skilling', type: 'category_total', category: 'Powerleveling', minTotal: 45, priority: 1 },
    { id: 'r4c3', row: 4, col: 3, label: '70kc PvM Mid', type: 'category_quantity', category: 'PvM Mid', minQuantity: 70, priority: 3 },
    { id: 'r4c4', row: 4, col: 4, label: '25kc PvM High', type: 'category_quantity', category: 'PvM High', minQuantity: 25, priority: 3 },
    { id: 'r4c5', row: 4, col: 5, label: '4 Diaries', type: 'category_quantity', category: 'Diary', minQuantity: 4, priority: 2 },

    { id: 'r5c1', row: 5, col: 1, label: '5 Diaries', type: 'category_quantity', category: 'Diary', minQuantity: 5, priority: 1 },
    { id: 'r5c2', row: 5, col: 2, label: 'Spend $75', type: 'spend_total', minTotal: 75, priority: 1 },
    { id: 'r5c3', row: 5, col: 3, label: '40kc PvM High', type: 'category_quantity', category: 'PvM High', minQuantity: 40, priority: 1 },
    { id: 'r5c4', row: 5, col: 4, label: '250kc PvM Low', type: 'category_quantity', category: 'PvM Low', minQuantity: 250, priority: 1 },
    { id: 'r5c5', row: 5, col: 5, label: '4 Minigames', type: 'category_quantity', category: 'Minigame', minQuantity: 4, priority: 1 },
];
const BINGO_CARD = {
    
  rows: 5,
  cols: 5,
  cells: rawCells.map(withRect), 
};

module.exports = { BINGO_CARD };