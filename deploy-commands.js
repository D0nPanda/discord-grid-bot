require('dotenv').config();
const { REST, Routes} = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID} = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Falta DISCORD_TOKEN en el archivo .env');
}

if (!CLIENT_ID) {
  throw new Error('Falta CLIENT_ID en el archivo .env');
}


const command = {
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
};

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function main() {
  console.log('Registrando comando Global');

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: [command] },
  );

  console.log('Comando registrado correctamente.');
}

main().catch((error) => {
  console.error('Error registrando comandos:', error);
  process.exit(1);
});