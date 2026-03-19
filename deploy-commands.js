require('dotenv').config();
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Falta DISCORD_TOKEN en el archivo .env');
}

if (!CLIENT_ID) {
  throw new Error('Falta CLIENT_ID en el archivo .env');
}

const commands = [
  {
    name: 'registerbingo',
    description: 'Registra un nuevo pedido en la hoja de Google Sheets',
    options: [
      {
        name: 'customer_id',
        type: 6, 
        description: 'ID del Cliente',
        required: true,
      },
      {
        name: 'order_id',
        type: 3, // STRING
        description: 'ID del Pedido',
        required: true,
      },
      {
        name: 'category',
        type: 3, // STRING
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
        type: 4, // INTEGER
        description: 'Cantidad del Pedido',
        required: true,
      },
      {
        name: 'total',
        type: 10, // NUMBER
        description: 'Total del Pedido',
        required: true,
      },
    ],
  },
  {
    name: 'promo',
    description: 'Genera una cuadrícula de descuento para un cliente',
    options: [
      {
        name: 'cliente',
        description: 'Usuario que podrá elegir la casilla',
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: 'trackgrid',
    description: 'Muestra el progreso del bingo/grid de un cliente',
    options: [
      {
        name: 'user',
        description: 'Cliente al que quieres consultar',
        type: 6,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function main() {
  console.log('Registrando comandos globales...');

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands },
  );

  console.log('Comandos registrados correctamente.');
}

main().catch((error) => {
  console.error('Error registrando comandos:', error);
  process.exit(1);
});