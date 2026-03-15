const { google } = require('googleapis');

function getGoogleSheetsClient() {
  const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || '';

  let privateKey = rawPrivateKey
    .trim()
    .replace(/^"(.*)"$/s, '$1')
    .replace(/\\n/g, '\n');

  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('GOOGLE_PRIVATE_KEY does not start with BEGIN PRIVATE KEY.');
  }

  if (!privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('GOOGLE_PRIVATE_KEY does not include END PRIVATE KEY.');
  }

  if (!privateKey.endsWith('\n')) {
    privateKey += '\n';
  }

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google Sheets credentials in environment variables.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({
    version: 'v4',
    auth,
  });
}

module.exports = { getGoogleSheetsClient };