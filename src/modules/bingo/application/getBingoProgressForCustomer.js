const { BINGO_CARD } = require('../config/bingoCard');
const { getOrdersByCustomerId } = require('../infrastructure/ordersRepository');
const { evaluateBingoProgress } = require('../domain/evaluateBingoProgress');

async function getBingoProgressForCustomer(customerId) {
  const entries = await getOrdersByCustomerId(customerId);
  const result = evaluateBingoProgress(entries, BINGO_CARD);

  return {
    customerId: String(customerId).trim(),
    entries,
    ...result,
  };
}

module.exports = { getBingoProgressForCustomer };