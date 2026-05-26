function notFoundHandler(req, res, next) {
    const error = new Error('Rota nao encontrada');
    error.status = 404;
    next(error);
}

function errorHandler(error, req, res, next) {
    const status = error.status || error.statusCode || 500;
    const response = {
        error: {
            message: status === 500 ? 'Erro interno do servidor' : error.message,
            status
        }
    };

    if (error.details) {
        response.error.details = error.details;
    }

    if (status === 500) {
        console.error(error);
    }

    return res.status(status).json(response);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
