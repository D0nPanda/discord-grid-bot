const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getBingoProgressForCustomer } = require('../../modules/bingo/application/getBingoProgressForCustomer');
const { renderGridImage } = require('../../modules/bingo/presentation/renderGridImage');

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

async function handleTrackgridCommand(interaction) {
  const targetUser = interaction.options.getUser('user', true);

  await interaction.deferReply({ ephemeral: true });

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
  });
}

module.exports = { handleTrackgridCommand };