// Configuración del logger con Winston.
// Un "logger" registra eventos de la app en archivos permanentes,
//con fecha y hora, pata poder revisarlos después (no se pierden al
// cerrar la consola, como sí pasa con console.log).
const winston = require('winston');

const logger = winston.createLogger({
    // level: nivel mínimo que se registra. 'info' incluye info, warn y error.
    level: 'info',

    //format: cómo se ve en cada línea del log. Le ponemos fecha/hora + JSON.
    format: winston.format.combine(
        winston.format.timestamp(), // agrega la fecha y hora a cada registro
        winston.format.json()       // guarda cada elemento como JSON (fácil de leer/filtrar)
    ),

    // transports: A DÓNDE se escriben los logs. Winston llama "transporte"
    // a cadadestino. Aquí usamos dos archivos.
    transports: [
        //1. Solo los errores van a este archivo.
        new winston.transports.File({ filename: 'logs/error.log', level: 'error'}),

        //2. Todo ( info, warn y error) va a este archivo.
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// En desarrollo, ademas de los archivos, tanbién mostramos en consola
// (para verlo en el momento mientras programamos).
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()     //formato simple y legible en consola
    }));
}

module.exports = logger;