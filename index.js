require('dotenv').config();

const crypto = require('node:crypto');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
} = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');

const {
  DISCORD_TOKEN,
  ROLE_5,
  ROLE_10,
  ROLE_15,
  ROLE_20,
} = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Falta DISCORD_TOKEN en tu archivo .env');
}

const BOARD_SIZE = 4;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const CELL_SIZE = 110;
const GAP = 12;
const PADDING = 24;
const HEADER_HEIGHT = 95;

const PRIZES = [
  { label: '5%', roleId: ROLE_5 || null },
  { label: '10%', roleId: ROLE_10 || null },
  { label: '15%', roleId: ROLE_15 || null },
  { label: 'VIP', roleId: null },
];

const games = new Map();
const activeByChannelTarget = new Map();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function createBoard() {
  const prizes = PRIZES.map((prize) => ({
    kind: 'prize',
    label: prize.label,
    roleId: prize.roleId,
  }));

  const skulls = Array.from({ length: TOTAL_CELLS - prizes.length }, () => ({
    kind: 'skull',
    label: '☠',
    roleId: null,
  }));

  return shuffle([...prizes, ...skulls]);
}

function createGame({ channelId, adminId, targetUserId }) {
  return {
    id: crypto.randomUUID().slice(0, 8),
    channelId,
    adminId,
    targetUserId,
    board: createBoard(),
    resolved: false,
    selectedIndex: null,
    createdAt: Date.now(),
  };
}

function buildButtons(game) {
  const rows = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const actionRow = new ActionRowBuilder();

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const index = row * BOARD_SIZE + col;
      const selected = game.selectedIndex === index;
      const selectedCell = selected ? game.board[index] : null;

      let style = ButtonStyle.Secondary;

      if (game.resolved && selected && selectedCell?.kind === 'prize') {
        style = ButtonStyle.Success;
      } else if (game.resolved && selected && selectedCell?.kind === 'skull') {
        style = ButtonStyle.Danger;
      }

      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`promo:${game.id}:${index}`)
          .setLabel(String(index + 1))
          .setStyle(style)
          .setDisabled(game.resolved),
      );
    }

    rows.push(actionRow);
  }

  return rows;
}

function drawCenteredText(ctx, text, x, y, width, height, font, color) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let offsetY = 0;

  if (text === '☠️') {
    offsetY = +4;
  }

  ctx.fillText(text, x + width / 2, y + height / 2 + offsetY);
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
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

async function renderBoard(game, { reveal = false } = {}) {
  const boardPixels =
    PADDING * 2 + BOARD_SIZE * CELL_SIZE + (BOARD_SIZE - 1) * GAP;

  const canvasSize = boardPixels;
  const canvas = createCanvas(canvasSize, canvasSize + HEADER_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#07111f';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#0b1b2b';
ctx.fillRect(0, 0, canvas.width, HEADER_HEIGHT);

  drawCenteredText(
  ctx,
  'SCRATCH & WIN!',
  0,
  5,
  canvas.width,
  64,
  'bold 50px sans-serif',
  '#ffffff',
);

 ctx.fillStyle = '#2c719a';
roundRect(
  ctx,
  14,
  HEADER_HEIGHT + 10,
  canvas.width - 28,
  canvas.height - HEADER_HEIGHT - 27,
  18,
);
ctx.fill();

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const x = PADDING + col * (CELL_SIZE + GAP);
    const y = HEADER_HEIGHT + PADDING + row * (CELL_SIZE + GAP);
    const cell = game.board[index];
    const selected = game.selectedIndex === index;

    let fill = '#7b8794';
  let border = '#d8dee9';
  let text = String(index + 1);
  let textColor = '#ffffff';
  let font = 'bold 30px sans-serif';

    if (reveal) {
  if (cell.kind === 'prize') {
    if (cell.label === 'VIP') {
      fill = selected ? '#16a34a' : '#d4a017';
      border = selected ? '#dcfce7' : '#fde68a';
      text = cell.label;
      textColor = '#ffffff';
      font = 'bold 26px sans-serif';
    } else {
      fill = selected ? '#16a34a' : '#2563eb';
      border = selected ? '#dcfce7' : '#dbeafe';
      text = cell.label;
      textColor = '#ffffff';
      font = 'bold 28px sans-serif';
    }
  } else {
    fill = selected ? '#7f1d1d' : '#6b7280';
    border = selected ? '#fca5a5' : '#d1d5db';
    text = '☠️';
    textColor = '#ffffff';
    font = 'bold 46px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  }
}

    roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 14);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = border;
    ctx.stroke();

    drawCenteredText(ctx, text, x, y, CELL_SIZE, CELL_SIZE, font, textColor);
  }

  return canvas.encode('png');
}

function buildHiddenEmbed(targetUserId) {
  return new EmbedBuilder()
    .setTitle('Chicks Boosting')
    .setDescription(`<@${targetUserId}>** Choose 1 Tile. **`)
    .setColor(0x1d4ed8)
    .setImage('attachment://board.png');
}

function buildResultEmbed({ game, cell, roleAssigned, roleAssignmentFailed }) {
  const embed = new EmbedBuilder()
    .setTitle('Chicks Boosting')
    .setImage('attachment://board.png');

  if (cell.kind === 'prize') {
  embed.setColor(0x16a34a);

  if (cell.label === 'VIP') {
    embed.setDescription(
      `🎉 **JACKPOT!** <@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and unlocked **VIP**!`,
    );
  } else {
    embed.setDescription(
      `<@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and won: **${cell.label}**.`,
    );
  }

    if (roleAssigned) {
      embed.addFields({
        name: 'Rol assigned',
        value: 'The prize role was automatically assigned.',
      });
    } else if (roleAssignmentFailed) {
      embed.addFields({
        name: 'Rol no asignado',
        value: 'No pude asignar el rol. Revisa permisos y jerarquía de roles.',
      });
    }
  } else {
    embed
      .setColor(0x6b7280)
      .setDescription(
        `<@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and didn't win.`,
      );
  }

  return embed;
}

async function assignPrizeRole(guild, userId, roleId) {
  if (!roleId) {
    return { assigned: false, failed: false };
  }

  try {
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId, 'Premio automático de promo descuento');
    return { assigned: true, failed: false };
  } catch (error) {
    console.error('No pude asignar el rol:', error);
    return { assigned: false, failed: true };
  }
}

function cleanupGame(game) {
  games.delete(game.id);
  activeByChannelTarget.delete(`${game.channelId}:${game.targetUserId}`);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot listo como ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === 'promo'
    ) {
      if (!interaction.inGuild()) {
        return interaction.reply({
          content: 'Este comando solo funciona dentro de un servidor.',
          ephemeral: true,
        });
      }

      const targetUser = interaction.options.getUser('cliente', true);

      if (targetUser.bot) {
        return interaction.reply({
          content: 'No tiene sentido crear una cuadrícula para otro bot.',
          ephemeral: true,
        });
      }

      const activeKey = `${interaction.channelId}:${targetUser.id}`;
      if (activeByChannelTarget.has(activeKey)) {
        return interaction.reply({
          content: 'Ese usuario ya tiene una cuadrícula activa en este canal.',
          ephemeral: true,
        });
      }

      const game = createGame({
        channelId: interaction.channelId,
        adminId: interaction.user.id,
        targetUserId: targetUser.id,
      });

      games.set(game.id, game);
      activeByChannelTarget.set(activeKey, game.id);

      const imageBuffer = await renderBoard(game, { reveal: false });
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'board.png' });

      await interaction.reply({
        embeds: [buildHiddenEmbed(targetUser.id)],
        files: [attachment],
        components: buildButtons(game),
        allowedMentions: { users: [targetUser.id] },
      });

      setTimeout(() => {
        const current = games.get(game.id);
        if (current && !current.resolved) {
          cleanupGame(current);
        }
      }, 30 * 60 * 1000).unref();

      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('promo:')) {
      const [, gameId, rawIndex] = interaction.customId.split(':');
      const game = games.get(gameId);

      if (!game) {
        return interaction.reply({
          content: 'Esta cuadrícula ya expiró o dejó de existir.',
          ephemeral: true,
        });
      }

      if (interaction.channelId !== game.channelId) {
        return interaction.reply({
          content: 'Esta cuadrícula no pertenece a este canal.',
          ephemeral: true,
        });
      }

      if (interaction.user.id !== game.targetUserId) {
        return interaction.reply({
          content: 'You can’t choose on a grid that isn’t yours.',
          ephemeral: true,
        });
      }

      if (game.resolved) {
        return interaction.reply({
          content: 'Esta cuadrícula ya fue resuelta.',
          ephemeral: true,
        });
      }

      game.resolved = true;
      game.selectedIndex = Number(rawIndex);

      const cell = game.board[game.selectedIndex];

      const roleResult =
        cell.kind === 'prize' && interaction.guild
          ? await assignPrizeRole(interaction.guild, game.targetUserId, cell.roleId)
          : { assigned: false, failed: false };

      const finalImage = await renderBoard(game, { reveal: true });
      const finalAttachment = new AttachmentBuilder(finalImage, { name: 'board.png' });

      await interaction.update({
  embeds: [
    buildResultEmbed({
      game,
      cell,
      roleAssigned: roleResult.assigned,
      roleAssignmentFailed: roleResult.failed,
    }),
  ],
  files: [finalAttachment],
  attachments: [],
  components: [],
  allowedMentions: { users: [game.targetUserId] },
});

      cleanupGame(game);
    }
  } catch (error) {
    console.error('Error procesando interacción:', error);

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Ocurrió un error procesando esta interacción.',
        ephemeral: true,
      });
    }
  }
});

client.login(DISCORD_TOKEN);