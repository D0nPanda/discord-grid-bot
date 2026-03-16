require('dotenv').config();

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const { handleTrackgridCommand } = require('./src/commands/bingo/trackgrid');
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
const { createCanvas, GlobalFonts, loadImage  } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath('./assets/fonts/Anton-Regular.ttf', 'Anton');

const skullIconPromise = loadImage(
  fs.readFileSync(path.join(__dirname, 'assets', 'icons', 'skull.png'))
);


const vipIconPromise = loadImage(
  fs.readFileSync(path.join(__dirname, 'assets', 'icons', 'vip.png'))
);

const {
  DISCORD_TOKEN,
  TEST_GUILD_ID,
  TEST_STAFF_ROLE_ID,
  MAIN_GUILD_ID,
  MAIN_STAFF_ROLE_ID,
  ROLE_5,
  ROLE_10,
  ROLE_15,
  ROLE_20, // Se deja por compatibilidad aunque ahora no se use
} = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Falta DISCORD_TOKEN en tu archivo .env');
}

const BOARD_SIZE = 4;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const CELL_SIZE = 110;
const GAP = 12;
const PADDING = 24;
const HEADER_HEIGHT = 110;

const PRIZES = [
  { label: '10kc', roleId:  null },
  { label: '20kc', roleId: null },
  { label: '35kc', roleId: null },
  { label: 'VIP', roleId: null },
  // Si luego quieres usar VIP, agrégalo aquí:
  // { label: 'VIP', roleId: ROLE_VIP || null },
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

  const skulls = Array.from(
    { length: TOTAL_CELLS - prizes.length },
    () => ({
      kind: 'skull',
      label: 'X',
      roleId: null,
    }),
  );

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
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.shadowBlur = 0;
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

  const canvas = createCanvas(boardPixels, boardPixels + HEADER_HEIGHT);
  const ctx = canvas.getContext('2d');
  const skullIcon = await skullIconPromise;
  const vipIcon = await vipIconPromise;

  // Fondo general
  ctx.fillStyle = '#04101d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#081a2f';
  ctx.fillRect(0, 0, canvas.width, HEADER_HEIGHT);

  drawCenteredText(
    ctx,
    'SCRATCH & WIN!',
    0,
    4,
    canvas.width,
    HEADER_HEIGHT - 10,
    '46px Anton',
    '#f8fafc',
  );

  // Marco exterior
  roundRect(
    ctx,
    14,
    HEADER_HEIGHT + 10,
    canvas.width - 28,
    canvas.height - HEADER_HEIGHT - 24,
    18,
  );
  ctx.fillStyle = '#3a86b7';
  ctx.fill();

  // Fondo interior
  roundRect(
    ctx,
    24,
    HEADER_HEIGHT + 20,
    canvas.width - 48,
    canvas.height - HEADER_HEIGHT - 44,
    14,
  );
  ctx.fillStyle = '#03152b';
  ctx.fill();

  // Borde Interior
  ctx.save();
  roundRect(
  ctx,
  24,
  HEADER_HEIGHT + 20,
  canvas.width - 48,
  canvas.height - HEADER_HEIGHT - 44,
  14,
);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
    ctx.restore();

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const x = PADDING + col * (CELL_SIZE + GAP);
    const y = HEADER_HEIGHT + PADDING + row * (CELL_SIZE + GAP);

    const cell = game.board[index];
    const selected = game.selectedIndex === index;

    let fill = '#4b5563';
    let border = '#f3f4f6';
    let text = '';
    let textColor = '#ffffff';
    let font = '28px Anton';

    
    if (reveal) {
      if (cell.kind === 'prize') {
        if (cell.label === 'VIP') {
          fill = selected ? '#16a34a' : '#111827';
          border = selected ? '#facc15' : '#eab308';
          text = 'VIP';
          font = '30px Anton';
        } else {
          fill = selected ? '#16a34a' : '#2f6df6';
          border = selected ? '#dcfce7' : '#e5efff';
          text = cell.label;
          font = '28px Anton';
        }
      } else {
        fill = selected ? '#991b1b' : '#4b5563';
        border = selected ? '#fecaca' : '#f3f4f6';
        text = '';
        font = '36px Anton';
      }
    }

    ctx.save();
ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
ctx.shadowBlur = 10;
ctx.shadowOffsetY = 3;

roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 14);
ctx.fillStyle = fill;
ctx.fill();

ctx.restore();

    ctx.lineWidth = 4;
    ctx.strokeStyle = border;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x + 4, y + 4, CELL_SIZE - 8, 18, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.fill();
    ctx.restore();
    
if (!reveal) {
  drawCenteredText(
    ctx,
    String(index + 1),
    x,
    y,
    CELL_SIZE,
    CELL_SIZE,
    '34px Anton',
    '#f8fafc'
  );
}
    if (reveal) {
  if (cell.kind === 'skull') {
    const iconSize = 52;
    ctx.drawImage(
      skullIcon,
      x + (CELL_SIZE - iconSize) / 2,
      y + (CELL_SIZE - iconSize) / 2 - 2,
      iconSize,
      iconSize
    );
  } else if (cell.kind === 'prize' && cell.label === 'VIP') {
    drawCenteredText(ctx, text, x, y + 10 , CELL_SIZE, 40, font, textColor);

    const iconSize = 40;
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.drawImage(
      vipIcon,
      x + (CELL_SIZE - iconSize) / 2,
      y + 58,
      iconSize,
      iconSize   
    );
  ctx.restore();
  }else {
    drawCenteredText(ctx, text, x, y, CELL_SIZE, CELL_SIZE, font, textColor);
    }
 }
}

  return canvas.encode('png');
}

function buildHiddenEmbed(targetUserId) {
  return new EmbedBuilder()
    .setTitle('Chicks Boosting')
    .setDescription(`<@${targetUserId}> **Choose 1 Tile.**`)
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
        `**JACKPOT!** <@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and unlocked **VIP <:vip:1481946248117223424>**!`,
      );
    } else {
      embed.setDescription(
        `<@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and won: **${cell.label}**.`,
      );
    }

    if (roleAssigned) {
      embed.addFields({
        name: 'Rol assigned',
        value: 'The rol was assigned automatically.',
      });
    } else if (roleAssignmentFailed) {
      embed.addFields({
        name: 'Rol was not assigned',
        value: 'I could not assign the role, check the permissions.',
      });
    }
  } else {
    embed
      .setColor(0x6b7280)
      .setDescription(
        `<@${game.targetUserId}> opened tile **#${game.selectedIndex + 1}** and hit a skull <:Skull_status_icon:1481723131528740929>.`,
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
function getStaffRoleIdForGuild(guildId) {
  if (guildId === TEST_GUILD_ID) return TEST_STAFF_ROLE_ID;
  if (guildId === MAIN_GUILD_ID) return MAIN_STAFF_ROLE_ID;
  return null;
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
          content: 'This command only works within a server.',
          ephemeral: true,
        });
      }
      
      const staffRoleId = getStaffRoleIdForGuild(interaction.guild.id);
      console.log('Guild actual:', interaction.guild.id);
      console.log('TEST_GUILD_ID:', TEST_GUILD_ID);
      console.log('MAIN_GUILD_ID:', MAIN_GUILD_ID);
      console.log('Staff role detectado:', staffRoleId);
      
      if (!staffRoleId) {
        return interaction.reply({
          content: 'This server is not configured to use this command.',
          ephemeral: true,
        });
      }

      if (!interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      const targetUser = interaction.options.getUser('cliente', true);

      if (targetUser.bot) {
        return interaction.reply({
          content: 'There is no point in creating a grid for another bot.',
          ephemeral: true,
        });
      }

      const activeKey = `${interaction.channelId}:${targetUser.id}`;

      if (activeByChannelTarget.has(activeKey)) {
        return interaction.reply({
          content: 'That user already has an active grid in this channel.',
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
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: 'board.png',
      });

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
        if (
      interaction.isChatInputCommand() &&
      interaction.commandName === 'trackgrid'
    ) {
      if (!interaction.inGuild()) {
        return interaction.reply({
          content: 'This command only works within a server.',
          ephemeral: true,
        });
      }

      const staffRoleId = getStaffRoleIdForGuild(interaction.guild.id);

      if (!staffRoleId) {
        return interaction.reply({
          content: 'This server is not configured to use this command.',
          ephemeral: true,
        });
      }

      if (!interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });
      }

      const targetUser = interaction.options.getUser('user', true);

      if (targetUser.bot) {
        return interaction.reply({
          content: 'There is no point in checking grid progress for another bot.',
          ephemeral: true,
        });
      }

      await handleTrackgridCommand(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('promo:')) {
      const [, gameId, rawIndex] = interaction.customId.split(':');
      const game = games.get(gameId);

      if (!game) {
        return interaction.reply({
          content: 'This grid has already expired or no longer exists, open a new one.',
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
          ? await assignPrizeRole(
              interaction.guild,
              game.targetUserId,
              cell.roleId,
            )
          : { assigned: false, failed: false };

      const finalImage = await renderBoard(game, { reveal: true });
      const finalAttachment = new AttachmentBuilder(finalImage, {
        name: 'board.png',
      });

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

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: 'Ocurrió un error procesando esta interacción.',
        ephemeral: true,
      });
    }
  }
});

client.login(DISCORD_TOKEN);