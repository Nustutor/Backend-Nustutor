require('dotenv').config();
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_SECRET

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Auth Error: Token not provided' });
    }

    try {

        jwt.verify(token, SECRET_KEY, (err, decoded) => {

            if (err) {

                return res.status(403).json({ message: 'Error when verifying token.' });
            }

            // Check if the decoded user ID matches the requested ID
            // if (req.params.uuid != null) {
            //     if (req.params.uuid !== decoded.userId) {
            //         return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
            //     }
            // }
            // else if (req.body.uuid != null) {
            //     if (req.body.uuid !== decoded.userId) {
            //         return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
            //     }
            // }


            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error when verifying token', error });
    }
};
