const { BINGO_CARD } = require('./config/bingoCard');
const { normalizeOrderRow } = require('./domain/normalizeOrders');
const { evaluateBingoProgress } = require('./domain/evaluateBingoProgress');

const rawRows = [
  { customerId: '2478683542982492', orderId: '1004', category: 'Powerleveling', quantity: 1, total: '$50.00' },
{ customerId: '2478683542982492', orderId: '1009', category: 'Powerleveling', quantity: 1, total: '$60.00' },
];

const entries = rawRows.map((row, index) => normalizeOrderRow(row, index));

const result = evaluateBingoProgress(entries, BINGO_CARD);

console.log('\n=== BINGO RESULT ===\n');
console.log(JSON.stringify(result, null, 2));

console.log('\n=== COMPLETED CELLS ===\n');
Object.values(result.cells)
  .filter((cell) => cell.completed)
  .sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  })
  .forEach((cell) => {
    console.log(`[${cell.row},${cell.col}] ${cell.label} | order: ${cell.matchedOrderId ?? 'FREE'}`);
  });

console.log('\n=== SUMMARY ===\n');
console.log(result.summary);

console.log('\n=== REWARDS ===\n');
console.log(result.rewardsUnlocked);