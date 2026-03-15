const { EmbedBuilder } = require('discord.js');
const { getBingoProgressForCustomer } = require('../../modules/bingo/application/getBingoProgressForCustomer');

function buildTrackgridEmbed({ targetUser, bingoResult }) {
  const completedRewards = bingoResult.rewardsUnlocked.length
    ? bingoResult.rewardsUnlocked.map((reward) => `• ${reward.label}`).join('\n')
    : 'No rewards unlocked yet.';

  return new EmbedBuilder()
    .setTitle('ChicksGold Grid Progress')
    .setDescription(
      `${targetUser}\nYour current progress in the Grid.`
    )
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
    );
}

async function handleTrackgridCommand(interaction) {
  const targetUser = interaction.options.getUser('user', true);

  await interaction.deferReply({ ephemeral: true });

  const bingoResult = await getBingoProgressForCustomer(targetUser.id);
  const embed = buildTrackgridEmbed({
    targetUser: `<@${targetUser.id}>`,
    bingoResult,
  });

  await interaction.editReply({
    embeds: [embed],
  });
}

module.exports = { handleTrackgridCommand };