const { google } = require('googleapis');
const sheets = google.sheets('v4');

// Asegúrate de importar correctamente el archivo que maneja la autenticación
const { auth } = require('../infrastructure/googleSheetsClient'); // Ruta ajustada según tu estructura

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
        description: 'Categoría del Pedido (PvM Low, PvM Mid, PvM High, Questing, Diary, Minigame, Powerleveling.)',
        required: true,
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
    const customer_id = interaction.options.getString('customer_id');
    const order_id = interaction.options.getString('order_id');
    const category = interaction.options.getString('category');
    const quantity = interaction.options.getInteger('quantity');
    const total = interaction.options.getNumber('total'); // Asegúrate de que sea un número

    console.log("Received parameters:", customer_id, order_id, category, quantity, total);

    // Validar que el 'category' esté en las opciones permitidas
    const validCategories = ['PvM Low', 'PvM Mid', 'PvM High', 'Questing', 'Diary', 'Minigame', 'Powerleveling'];
    if (!validCategories.includes(category)) {
      console.log("Invalid category:", category);  // Log cuando la categoría no es válida
      return interaction.reply('Invalid category. Please choose a valid category.');
    }

    console.log("Category is valid, proceeding to insert data...");

    // Datos a insertar
    const rowData = [customer_id, order_id, category, quantity, total];
    console.log("Data to be inserted:", rowData); // Log para depuración

    try {
      // Aquí insertamos los datos en la hoja de Google Sheets
      const response = await sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: '1cnvF1AbQBDB3YacOp_UsVUDdUXzXEmsEjhrzmDeXNac',
        range: 'Orders_Table!A2:E2', // Rango ajustado según tu hoja
        valueInputOption: 'RAW',
        resource: {
          values: [rowData],
        },
      });

      console.log('Response from Google Sheets:', response); // Log para depuración

      return interaction.reply('Data successfully added to the sheet');
    } catch (error) {
      // Agregar más detalles del error
      console.error('Error adding data:', error.response ? error.response.data : error);
      return interaction.reply('Data was not added to the sheet. Please try again.');
    }
  },
};