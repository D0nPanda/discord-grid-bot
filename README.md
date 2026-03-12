# Discount Grid Bot

Bot de Discord con una cuadrícula 4x4 de descuentos.

## Comando
`/promo-descuento cliente:@usuario`

## Qué hace
- Genera una cuadrícula 4x4
- Coloca aleatoriamente 4 premios: 5%, 10%, 15%, 20%
- Rellena el resto con calaveras
- Muestra una imagen inicial
- El usuario objetivo pulsa un botón del 1 al 16
- El bot revela el tablero final
- Si ganó, intenta asignar el rol del premio

## Instalación

1. Instala Node.js
2. Ejecuta:
   npm install

3. Copia `.env.example` a `.env`
4. Completa las variables
5. Registra el comando:
   npm run deploy

6. Inicia el bot:
   npm start