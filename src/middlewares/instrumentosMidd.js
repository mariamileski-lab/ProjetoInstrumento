const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const { jwtSecret } = require('../config/auth');

function instrumentosMidd(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
        return next(new AppError('Token nao fornecido', 401));
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        req.user = decoded;

        next();
    } catch (error) {
        return next(new AppError('Token invalido', 401));
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.tipo !== 'admin') {
        return next(new AppError('Acesso permitido apenas para admin', 403));
    }

    next();
}

module.exports = instrumentosMidd;
module.exports.requireAdmin = requireAdmin;
