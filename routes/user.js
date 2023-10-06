const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

router.get('/api/users', (req, res) => {
    // Your SQL query goes here
    const sqlQuery = 'SELECT * FROM users';

    mysqlConnection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});



module.exports = router;