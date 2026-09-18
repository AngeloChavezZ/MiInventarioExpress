const logger = require('../config/logger');

// Middleware de error global.
// Firma de 4 parámetros (err, req, res, next): 
// así Express sabe que es un manejador de ERRORES, no un middleware normal.
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    // Registrar el error con logger (consola + archivos logs/)
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`,{
        message: err.message,
        stack: err.stack,
    });


    // En producción no mostramos detalles internos al usuario
    const message =
        statusCode === 500 && isProduction
        ? 'Error interno del servidor'
        : err.message;

    // Si es petición de API (fetch/axios), responder JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(isProduction ? {} : {stack: err.stack}),

        });
    }
// Si es navegador, renderizar la vista de error
res.status(statusCode).render('error', {
    statusCode,
    message,
});
};

module.exports = errorHandler;