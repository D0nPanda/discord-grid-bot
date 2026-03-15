const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const BASE_IMAGE_PATH = path.join(process.cwd(), 'assets', 'bingo', 'bingo-grid-base.png');

async function renderGridImage(bingoResult) {
  const baseImage = await loadImage(BASE_IMAGE_PATH);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

  const completedCells = Object.values(bingoResult.cells).filter(
    (cell) => cell.completed && cell.type !== 'free_space' && cell.rect
  );

  for (const cell of completedCells) {
    drawCompletedOverlay(ctx, cell.rect);
  }

  return canvas.toBuffer('image/png');
}

function drawCompletedOverlay(ctx, rect) {
  const { x, y, width, height } = rect;
  const radius = 8;

  ctx.save();

  // fondo verde translúcido
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = 'rgba(46, 204, 113, 0.34)';
  ctx.fill();

  // borde verde fuerte
  roundedRect(ctx, x + 1, y + 1, width - 2, height - 2, radius);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(46, 204, 113, 0.95)';
  ctx.stroke();

  // glow suave
  ctx.shadowColor = 'rgba(46, 204, 113, 0.55)';
  ctx.shadowBlur = 12;
  roundedRect(ctx, x + 2, y + 2, width - 4, height - 4, radius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(46, 204, 113, 0.70)';
  ctx.stroke();

  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

module.exports = { renderGridImage };