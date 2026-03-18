const { google } = require('googleapis');
const { authenticateGoogleSheets } = require('../infrastructure/googleSheetsClient'); // Ajuste según la ubicación de tu archivo de autenticación

module.exports = {
  name: 'registerbingo',
  description: 'Record bingo data in Google Sheets',
  async execute(message, args) {
    console.log('Comando recibido:', args);
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return message.reply("You don't have permission to execute this command.");
    }

    // Tomamos los argumentos: customer-id, order-id, category, quantity, total
    const customerId = args[0];
    const orderId = args[1];
    const category = args[2];
    const quantity = args[3];
    const total = args[4];

    try {
        console.log('Datos obtenidos:', { customerId, orderId, category, quantity, total });
      // Autenticación con Google Sheets
      const sheets = google.sheets({ version: 'v4', auth: await authenticateGoogleSheets() });

      // Definimos el rango en la hoja de Google Sheets
      const range = 'Orders_Table!A2:E'; // Ajustar según la ubicación exacta de las columnas
      const valueInputOption = 'RAW'; // Insertar el valor sin formato
      const resource = {
        values: [
          [customerId, orderId, category, quantity, total], // Insertar los datos en las columnas correspondientes
        ],
      };

      // Llamada para agregar datos a la hoja
      await sheets.spreadsheets.values.append({
        spreadsheetId: '1cnvF1AbQBDB3YacOp_UsVUDdUXzXEmsEjhrzmDeXNac', // ID de la hoja de Google Sheets
        range,
        valueInputOption,
        resource,
      });

      message.reply("The bingo data has been recorded successfully.");
    } catch (error) {
      console.error('Error registering the data.:', error);
      message.reply("There was an error recording the data. Please try again..");
    }
  },
};