const { google } = require('googleapis');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getGoogleSheetsClient } = require('../../modules/bingo/infrastructure/googleSheetsClient');

module.exports = {
  data: {
    name: 'registerbingo',
    description: 'Registra un nuevo pedido en la hoja de Google Sheets',
    options: [
      {
        name: 'customer_id',
        type: 'STRING',
        description: 'ID del Cliente',
        required: true,
      },
      {
        name: 'order_id',
        type: 'STRING',
        description: 'ID del Pedido',
        required: true,
      },
      {
        name: 'category',
        type: 'STRING',
        description: 'Categoría del Pedido',
        required: true,
        choices: [
          { name: 'PvM Low', value: 'PvM Low' },
          { name: 'PvM Mid', value: 'PvM Mid' },
          { name: 'PvM High', value: 'PvM High' },
          { name: 'Questing', value: 'Questing' },
          { name: 'Diary', value: 'Diary' },
          { name: 'Minigame', value: 'Minigame' },
          { name: 'Powerleveling', value: 'Powerleveling' }
        ]
      },
      {
        name: 'quantity',
        type: 'INTEGER',
        description: 'Cantidad del Pedido',
        required: true,
      },
      {
        name: 'total',
        type: 'NUMBER',
        description: 'Total del Pedido',
        required: true,
      },
    ],
  },

  async execute(interaction) {
    // Logs para verificar que el comando se está ejecutando
    console.log("Command received: registerbingo");

    // Obtener los parámetros de la interacción
    const target_user = interaction.options.getUser('target_user');
    const order_id = interaction.options.getString('order_id');
    const category = interaction.options.getString('category'); // Aquí obtenemos la categoría seleccionada
    const quantity = interaction.options.getInteger('quantity');
    const total = interaction.options.getNumber('total'); // Asegúrate de que sea un número
    const customer_id = target_user.id;

    console.log("Received parameters:", customer_id, order_id, category, quantity, total);

    // Validar la categoría seleccionada
    const validCategories = [
      'PvM Low', 'PvM Mid', 'PvM High', 'Questing', 'Diary', 'Minigame', 'Powerleveling'
    ];

    if (!validCategories.includes(category)) {
      return interaction.reply('Invalid category. Please choose a valid category.');
    }

   const sheets = getGoogleSheetsClient();

    const request = {
      spreadsheetId: '1cnvF1AbQBDB3YacOp_UsVUDdUXzXEmsEjhrzmDeXNac', // Reemplaza con tu ID de hoja
      range: 'Orders!A2:E', // Reemplaza con el rango adecuado
      valueInputOption: 'RAW',
      resource: {
        values: [
          [customer_id, order_id, category, quantity, total],
        ],
      },
    };

    try {
      // Insertar los datos en la hoja de Google Sheets
      await sheets.spreadsheets.values.append(request);

      // Responder al usuario
      await interaction.reply({
        content: `Category ${category} has been selected for the order.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error inserting data into Google Sheets:', error);
      await interaction.reply({
        content: 'There was an error registering your order.',
        ephemeral: true,
      });
    }
  }
};