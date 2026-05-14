const jwt = require('jsonwebtoken');

function instrumentosMidd(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            message: 'Token nao fornecido'
        });
    }

    try {
        const decoded = jwt.verify(token, 'segredo');

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token invalido'
        });
    }
}

module.exports = instrumentosMidd;
