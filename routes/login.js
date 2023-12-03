const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');
const jwt = require('jsonwebtoken');


require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        const getUser = `
            SELECT BIN_TO_UUID(uuid) as uuid,
            firstname,
            lastname,
            semester,
            degree,
            dept,
            email,
            password_hash,
            verifiedEmail,
            emailVerificationCode,
            bio
            FROM users
            WHERE email = ?;
        `;

        db.query(getUser, [email], async (err, result) => {
            if (err) {
                console.error('Error getting user:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting user', err });
            }

            if (result.length === 0) {
                return res.status(401).json({ error: 'Email field missing or does not exist.' });
            }

            const match = await bcrypt.compare(password, result[0].password_hash);

            if (!match) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            if (!result[0].verifiedEmail) {
                return res.status(401).json({ error: 'Email not verified.' });
            }

            const token = jwt.sign({ userId: result[0].uuid }, SECRET_KEY, { expiresIn: '48h' });

            return res.json({ userID: result[0].uuid, token: token });
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error when logging in.' });
    }
});

module.exports = router;