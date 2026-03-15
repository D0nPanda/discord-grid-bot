const path = require('path');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { getBingoProgressForCustomer } = require('../../modules/bingo/application/getBingoProgressForCustomer');

const BASE_IMAGE_PATH = path.join(process.cwd(), 'assets', 'bingo', 'bingo-grid-base.png');

function buildTrackgridEmbed({ targetUser, bingoResult }) {
  const completedRewards = bingoResult.rewardsUnlocked.length
    ? bingoResult.rewardsUnlocked.map((reward) => `• ${reward.label}`).join('\n')
    : 'No rewards unlocked yet.';

  return new EmbedBuilder()
    .setTitle('ChicksGold Grid Progress')
    .setDescription(`${targetUser}\nYour current progress in the Grid.`)
    .addFields(
      {
        name: 'Unlocked Rewards',
        value: completedRewards,
        inline: false,
      },
      {
        name: 'Squares Completed',
        value: `${bingoResult.summary.completedSquares} / ${bingoResult.summary.totalSquares}`,
        inline: true,
      },
      {
        name: 'Progress',
        value: `${bingoResult.summary.progressPercent}%`,
        inline: true,
      }
    )
    .setImage('attachment://grid-progress.png');
}

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
  drawCompletedLines(ctx, bingoResult);
  return canvas.toBuffer('image/png');
}

function drawCompletedOverlay(ctx, rect) {
  const { x, y, width, height } = rect;
  const radius = 6;

  ctx.save();

  // fondo verde translúcido
  ctx.beginPath();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = 'rgba(46, 204, 113, 0.30)';
  ctx.fill();

  // borde verde limpio
  ctx.beginPath();
  roundedRect(ctx, x + 1, y + 1, width - 2, height - 2, radius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(46, 204, 113, 0.90)';
  ctx.stroke();

  ctx.restore();
}
function drawCompletedLines(ctx, bingoResult) {
  const cells = Object.values(bingoResult.cells).filter((cell) => cell.rect);

  const completedRows = bingoResult.summary.completedRows || [];
  const completedCols = bingoResult.summary.completedCols || [];

  for (const row of completedRows) {
    const rowCells = cells
      .filter((cell) => cell.row === row)
      .sort((a, b) => a.col - b.col);

    if (rowCells.length === 0) continue;

    const first = rowCells[0].rect;
    const last = rowCells[rowCells.length - 1].rect;

    drawLineHighlight(
      ctx,
      first.x - 2,
      first.y - 2,
      (last.x + last.width) - first.x + 4,
      first.height + 4
    );
  }

  for (const col of completedCols) {
    const colCells = cells
      .filter((cell) => cell.col === col)
      .sort((a, b) => a.row - b.row);

    if (colCells.length === 0) continue;

    const first = colCells[0].rect;
    const last = colCells[colCells.length - 1].rect;

    drawLineHighlight(
      ctx,
      first.x - 2,
      first.y - 2,
      first.width + 4,
      (last.y + last.height) - first.y + 4
    );
  }
}

function drawLineHighlight(ctx, x, y, width, height) {
  const radius = 10;

  ctx.save();

  ctx.shadowColor = 'rgba(255, 215, 0, 0.55)';
  ctx.shadowBlur = 14;

  ctx.beginPath();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.90)';
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  roundedRect(ctx, x + 2, y + 2, width - 4, height - 4, radius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 240, 170, 0.85)';
  ctx.stroke();

  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

async function handleTrackgridCommand(interaction) {
  const targetUser = interaction.options.getUser('user', true);

  await interaction.deferReply();

  const bingoResult = await getBingoProgressForCustomer(targetUser.id);
  const imageBuffer = await renderGridImage(bingoResult);

  const attachment = new AttachmentBuilder(imageBuffer, {
    name: 'grid-progress.png',
  });

  const embed = buildTrackgridEmbed({
    targetUser: `<@${targetUser.id}>`,
    bingoResult,
  });

  await interaction.editReply({
    embeds: [embed],
    files: [attachment],
    allowedMentions: { users: [targetUser.id] },
  });
}

module.exports = { handleTrackgridCommand };