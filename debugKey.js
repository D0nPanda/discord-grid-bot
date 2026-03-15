require('dotenv').config();

const raw = process.env.GOOGLE_PRIVATE_KEY || '';

let cleaned = raw
  .trim()
  .replace(/^"(.*)"$/s, '$1')
  .replace(/\\n/g, '\n');

if (!cleaned.endsWith('\n')) {
  cleaned += '\n';
}

console.log('RAW length:', raw.length);
console.log('CLEANED starts with BEGIN:', cleaned.startsWith('-----BEGIN PRIVATE KEY-----'));
console.log('CLEANED includes END:', cleaned.includes('-----END PRIVATE KEY-----'));
console.log('CLEANED ends with END newline:', cleaned.endsWith('-----END PRIVATE KEY-----\n'));
console.log('CLEANED preview first 40:', JSON.stringify(cleaned.slice(0, 40)));
console.log('CLEANED preview last 40:', JSON.stringify(cleaned.slice(-40)));