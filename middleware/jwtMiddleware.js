const jwt = require('jsonwebtoken')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_SECRET

module.exports = function (req, res, next) {
    const token = req.header("token")
    if (!token) {
        return res.status(401).json({ message: "Auth Error: Token not provided" });
    }
    try {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            console.log(err)

            if (err) return res.sendStatus(403)

            req.user = user

            next()
        })
    }

    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when verifying token', error });
    }
}