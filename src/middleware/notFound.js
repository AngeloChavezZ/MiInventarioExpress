// Middleware normal de 3 parámetros para rutas que no existen (404).
// Crea el error y se lo pasa al errorHandler global con next().
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = notFound;