const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');

router.post('/', async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, semester, degree, dept, bio } = req.body;

        const saltRounds = 12

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the 'users' table
        const insertUserQuery = `
            INSERT INTO users (uuid, username, email, password_hash, firstname, lastname, semester, degree, dept, bio)
            VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertUserQuery,
            [username, email, hashedPassword, firstname, lastname, semester, degree, dept, bio],
            (err, results) => {
                if (err) {
                    console.error('Error creating user:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log('User created successfully');
                    res.status(201).json({ message: 'User created successfully' });
                }
            }
        );
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
