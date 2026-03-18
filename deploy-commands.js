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
  {
    name: 'registerbingo',
    description: 'Record bingo data in Google Sheets',
    options: [
      {
        name: 'customer-id',
        description: 'Customer ID ',
        type: 3, 
        required: true,
      },
      {
        name: 'order-id',
        description: 'Order ID ',
        type: 3, 
        required: true,
      },
      {
        name: 'category',
        description: 'Order category',
        type: 3, 
        required: true,
      },
      {
        name: 'quantity',
        description: 'Order amount',
        type: 4, 
        required: true,
      },
      {
        name: 'total',
        description: 'Total amount paid',
        type: 4, 
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