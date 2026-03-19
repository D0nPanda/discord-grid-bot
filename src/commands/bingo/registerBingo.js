const { google } = require('googleapis');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getGoogleSheetsClient } = require('../../modules/bingo/infrastructure/googleSheetsClient');

module.exports = {
  data: {
    name: 'registerbingo',
    description: 'Registra un nuevo pedido en la hoja de Google Sheets',
    options: [
      {
        name: 'target_user',
        type: 'USER',
        description: 'Usuario objetivo (para asignar al pedido)',
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
    const category = interaction.options.getString('category');
    const quantity = interaction.options.getInteger('quantity');
    const total = interaction.options.getNumber('total');
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
    const spreadsheetId = '1cnvF1AbQBDB3YacOp_UsVUDdUXzXEmsEjhrzmDeXNac'; // ID de la hoja de cálculo
    const range = 'Orders!A2:E'; // Rango para agregar datos (se empieza desde la fila 2 para evitar sobreescribir los encabezados)

    try {
      // Obtener los datos actuales en el rango (A2:E)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      // Obtener la última fila usada
      const rows = response.data.values || [];
      const nextRow = rows.length + 2; // Calcula la siguiente fila vacía para agregar los datos

      const request = {
        spreadsheetId,
        range: `Orders!A${nextRow}:E${nextRow}`, // Utiliza la siguiente fila vacía
        valueInputOption: 'RAW',
        resource: {
          values: [
            [customer_id, order_id, category, quantity, total],
          ],
        },
      };

      // Insertar los datos en la hoja de Google Sheets
      await sheets.spreadsheets.values.update(request);

      // Responder al usuario
      await interaction.reply({
        content: `Order successfully registered for ${target_user.username} in the ${category} category.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error inserting data into Google Sheets:', error);
      await interaction.reply({
        content: 'There was an error processing your order.',
        ephemeral: true,
      });
    }
  }
};