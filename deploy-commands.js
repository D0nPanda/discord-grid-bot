require('dotenv').config();
const { REST, Routes, PermissionFlagsBits } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('Falta DISCORD_TOKEN en el archivo .env');
}

if (!CLIENT_ID) {
  throw new Error('Falta CLIENT_ID en el archivo .env');
}

if (!GUILD_ID) {
  throw new Error('Falta GUILD_ID en el archivo .env');
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
  default_member_permissions: String(PermissionFlagsBits.ManageGuild),
};

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function main() {
  console.log('Registrando comando en el servidor de pruebas...');

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: [command] },
  );

  console.log('Comando registrado correctamente.');
}

main().catch((error) => {
  console.error('Error registrando comandos:', error);
  process.exit(1);
});