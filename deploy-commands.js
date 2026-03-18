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
        description: 'ID del Cliente',
        type: 3,  // STRING
        required: true,
      },
      {
        name: 'order_id',
        description: 'ID del Pedido',
        type: 3,  // STRING
        required: true,
      },
      {
        name: 'category',
        description: 'Categoría del Pedido',
        type: 3,  // STRING
        required: true,
      },
      {
        name: 'quantity',
        description: 'Cantidad del Pedido',
        type: 4,  // INTEGER
        required: true,
      },
      {
        name: 'total',
        description: 'Total del Pedido',
        type: 10,  // NUMBER (decimal)
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