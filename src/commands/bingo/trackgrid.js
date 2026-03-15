const { getBingoProgressForCustomer } = require('../../modules/bingo/application/getBingoProgressForCustomer');
const { buildTrackgridEmbed } = require('../../modules/bingo/presentation/embed');

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