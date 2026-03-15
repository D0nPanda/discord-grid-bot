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