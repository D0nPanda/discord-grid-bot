require('dotenv').config();

const { getBingoProgressForCustomer } = require('./application/getBingoProgressForCustomer');

async function main() {
  const customerId = '247868354298249217';

  const result = await getBingoProgressForCustomer(customerId);

  console.log('\n=== CUSTOMER ===\n');
  console.log(result.customerId);

  console.log('\n=== ENTRIES ===\n');
  console.log(result.entries);

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
}

main().catch((error) => {
  console.error('\nERROR running testSheetsBingo:\n');
  console.error(error);
});